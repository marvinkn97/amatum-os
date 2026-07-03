package dev.marvin.stack;

import org.jetbrains.annotations.Nullable;
import software.amazon.awscdk.*;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.ecs.*;
import software.amazon.awscdk.services.ecs.Protocol;
import software.amazon.awscdk.services.logs.LogGroup;
import software.amazon.awscdk.services.logs.RetentionDays;
import software.amazon.awscdk.services.msk.CfnCluster;
import software.amazon.awscdk.services.rds.*;
import software.amazon.awscdk.services.route53.CfnHealthCheck;
import software.constructs.Construct;

import java.lang.System.Logger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static java.lang.System.Logger.Level;

public class LocalStack extends Stack {
    private static final Logger logger = System.getLogger(LocalStack.class.getName());

    private final Vpc vpc;
    private final Cluster ecsCluster;

    public LocalStack(@Nullable Construct scope, @Nullable String id, @Nullable StackProps props) {
        super(scope, id, props);

        this.vpc = createVpc();

        DatabaseInstance keycloakDB = createDatabase("KeycloakDB", "amatum-keycloak-db");
        DatabaseInstance identityServiceDB = createDatabase("IdentityServiceDB", "identity-service-db");
        DatabaseInstance courseServiceDB = createDatabase("CourseServiceDB", "course-service-db");
        DatabaseInstance enrollmentServiceDB = createDatabase("EnrollmentServiceDB", "enrollment-service-db");
        DatabaseInstance ratingServiceDB = createDatabase("RatingServiceDB", "rating-service-db");

        CfnHealthCheck keycloakDbHealthCheck = createDbHealthCheck(keycloakDB, "keycloakDbHealthCheck");
        CfnHealthCheck identityServiceDbHealthCheck = createDbHealthCheck(identityServiceDB, "identityServiceDbHealthCheck");
        CfnHealthCheck courseServiceDbHealthCheck = createDbHealthCheck(courseServiceDB, "courseServiceDbHealthCheck");
        CfnHealthCheck enrollmentServiceDbHealthCheck = createDbHealthCheck(enrollmentServiceDB, "enrollmentServiceDbHealthCheck");
        CfnHealthCheck ratingServiceDbHealthCheck = createDbHealthCheck(ratingServiceDB, "ratingServiceDbHealthCheck");


        CfnCluster mskCluster = createMskCluster();

        this.ecsCluster = createEcsCluster();

        FargateService courseService = createFargateService(
                "CourseService",
                "course-service",
                List.of(8080),
                courseServiceDB,
                Map.of());
        courseService.getNode().addDependency(courseServiceDB);
        courseService.getNode().addDependency(courseServiceDbHealthCheck);
    }


    static void main() {
        App app = new App(AppProps.builder().outdir("./cdk.out").build());

        StackProps stackProps = StackProps.builder()
                .synthesizer(new BootstraplessSynthesizer())
                .build();

        new LocalStack(app, "localstack", stackProps);

        app.synth();

        logger.log(Level.INFO, "App synthesizing in progress...");
    }

    private Vpc createVpc() {
        return Vpc.Builder
                .create(this, "AmatumVpc")
                .vpcName("AmatumVpc")
                .maxAzs(2)
                .build();
    }

    private DatabaseInstance createDatabase(String id, String databaseName) {
        return DatabaseInstance.Builder
                .create(this, id)
                .engine(DatabaseInstanceEngine.postgres(
                        PostgresInstanceEngineProps.builder()
                                .version(PostgresEngineVersion.VER_18_3)
                                .build()))
                .vpc(vpc)
                .instanceType(InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.MICRO))
                .allocatedStorage(20)
                .credentials(Credentials.fromGeneratedSecret("admin"))
                .databaseName(databaseName)
                .removalPolicy(RemovalPolicy.DESTROY)
                .build();
    }

    private CfnHealthCheck createDbHealthCheck(DatabaseInstance databaseInstance, String id) {
        return CfnHealthCheck.Builder
                .create(this, id)
                .healthCheckConfig(
                        CfnHealthCheck.HealthCheckConfigProperty.builder()
                                .type("TCP")
                                .port(Token.asNumber(databaseInstance.getDbInstanceEndpointPort()))
                                .ipAddress(databaseInstance.getDbInstanceEndpointAddress())
                                .requestInterval(30)
                                .failureThreshold(3)
                                .build())
                .build();
    }

    private CfnCluster createMskCluster() {
        return CfnCluster.Builder
                .create(this, "MskCluster")
                .clusterName("kafka-cluster")
                .kafkaVersion("4.3.0")
                .numberOfBrokerNodes(1)
                .brokerNodeGroupInfo(
                        CfnCluster.BrokerNodeGroupInfoProperty.builder()
                                .instanceType("kafka.m5.xlarge")
                                .clientSubnets(vpc.getPrivateSubnets()
                                        .stream()
                                        .map(ISubnet::getSubnetId)
                                        .toList())
                                .brokerAzDistribution("DEFAULT")
                                .build())
                .build();

    }

    private Cluster createEcsCluster() {
        return Cluster.Builder
                .create(this, "AmatumCluster")
                .vpc(vpc)
                .clusterName("AmatumCluster")
                .defaultCloudMapNamespace(
                        CloudMapNamespaceOptions.builder()
                                .name("amatum.local")
                                .build())
                .build();
    }

    private FargateService createFargateService(String id, String image, List<Integer> ports, DatabaseInstance databaseInstance, Map<String, String> additionalEnvVars) {
        FargateTaskDefinition fargateTaskDefinition = FargateTaskDefinition.Builder
                .create(this, id + "Task")
                .cpu(256)
                .memoryLimitMiB(512)
                .build();

        ContainerDefinitionOptions.Builder containerDefinitionOptions = ContainerDefinitionOptions.builder()
                .image(ContainerImage.fromRegistry(image))
                .portMappings(ports.stream()
                        .map(port -> PortMapping.builder()
                                .containerPort(port)
                                .hostPort(port)
                                .protocol(Protocol.TCP)
                                .build())
                        .toList())
                .logging(LogDriver.awsLogs(
                        AwsLogDriverProps.builder()
                                .logGroup(LogGroup.Builder.create(this, id + "LogGroup")
                                        .logGroupName("/ecs/" + image)
                                        .removalPolicy(RemovalPolicy.DESTROY)
                                        .retention(RetentionDays.ONE_DAY)
                                        .build())
                                .build()));

        Map<String, String> envVars = new HashMap<>();
        envVars.put("SPRING_KAFKA_BOOTSTRAP-SERVERS", "localhost.localstack.cloud:4510, localhost.localstack.cloud:4511, localhost.localstack.cloud:4512");

        if(additionalEnvVars != null) {
            envVars.putAll(additionalEnvVars);
        }

        if(databaseInstance != null) {
            envVars.put("SPRING_DATASOURCE_URL", "jdbc:postgresql://%s:%s/%s-db".formatted(databaseInstance.getDbInstanceEndpointAddress(), databaseInstance.getDbInstanceEndpointPort(), image));
            envVars.put("SPRING_DATASOURCE_USERNAME", "admin");
            envVars.put("SPRING_DATASOURCE_PASSWORD", Objects.requireNonNull(databaseInstance.getSecret()).secretValueFromJson("password").toString());
            envVars.put("SPRING_JPA_HHIBERNATE_DDL_AUTO", "update");
            envVars.put("SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT", "org.hibernate.dialect.PostgreSQLDialect");
            envVars.put("SPRING_JPA_PROPERTIES_HIBERNATE_SHOW_SQL", "true");
            envVars.put("SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL", "true");
            envVars.put("SPRING_DATASOURCE_HIKARI_INITIALIZATION_FAIL_TIMEOUT", "60000");

        }

        containerDefinitionOptions.environment(envVars);
        fargateTaskDefinition.addContainer(image + "Container", containerDefinitionOptions.build());

        return FargateService.Builder
                .create(this, id)
                .cluster(ecsCluster)
                .taskDefinition(fargateTaskDefinition)
                .assignPublicIp(false)
                .serviceName(image)
                .build();
    }

}
