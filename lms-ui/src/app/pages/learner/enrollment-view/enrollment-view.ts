import {
  Component,
  signal,
  OnInit,
  inject,
  computed,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  CertificateResponse,
  EnrollmentResponse,
  EnrollmentService,
  QuizAttemptRequest,
  QuizAttemptResponse,
} from '../../../services/enrollment.service';
import { finalize, map, Subject, takeUntil, filter, repeat, take, timeout } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LearningStepResponse } from '../../../services/learning-step.service';
import { FormsModule } from '@angular/forms';
import { RatingRequest, RatingService } from '../../../services/rating.service';

@Component({
  selector: 'app-enrollment-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- VIEWPORT WRAPPER -->
    <div
      class="absolute inset-0 flex flex-col bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden"
    >
      @if (isLoading()) {
        <div class="max-w-7xl mx-auto px-6 py-20 text-center">
          <div
            class="size-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"
          ></div>
        </div>
      } @else if (enrollment()) {
        <!-- TOP NAVIGATION -->
        <nav
          class="h-16 border-b border-white/5 bg-[#030712]/95 backdrop-blur-3xl flex items-center justify-between px-4 md:px-8 shrink-0 z-130"
        >
          <div class="flex items-center gap-4 md:gap-6 min-w-0">
            <!-- Back Button -->
            <button
              (click)="goBack()"
              class="flex items-center gap-3 text-slate-500 hover:text-white transition-all group cursor-pointer bg-transparent border-none p-0 outline-none shrink-0"
            >
              <div class="size-8 flex items-center justify-center">
                <svg
                  class="size-4 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>

            <div class="h-5 w-px bg-white/5 hidden md:block"></div>

            <!-- Course Title -->
            <div
              class="flex flex-col min-w-0 cursor-pointer group"
              (click)="selectedStep.set(null)"
            >
              <span
                class="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500 italic leading-none group-hover:text-indigo-400 transition-colors"
                >Course</span
              >
              <h1
                class="text-sm md:text-md font-black text-white uppercase italic tracking-tighter leading-none mt-1 truncate max-w-40 md:max-w-none"
              >
                {{ enrollment()?.course?.title }}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-4 md:gap-6">
            <!-- DYNAMIC BURGER TOGGLE -->
            <button
              (click)="sidebarVisible.set(!sidebarVisible())"
              class="flex items-center justify-center size-8 rounded-xl outline-none cursor-pointer transition-all active:scale-95 group border"
              [ngClass]="
                sidebarVisible()
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              "
            >
              <svg
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <!-- Progress Stats -->
            <div class="hidden sm:flex flex-col items-end">
              <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest"
                >Completed</span
              >
              <span class="text-xs font-bold text-white italic tracking-tighter"
                >{{ completedStepsCount() }} / {{ totalStepsCount() }} STEPS</span
              >
            </div>

            <!-- Circular Progress -->
            <div class="relative size-10 shrink-0">
              <svg class="size-full -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  class="stroke-white/10"
                  stroke-width="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  class="stroke-indigo-500 transition-all duration-1000 ease-out"
                  stroke-width="3.5"
                  [style.stroke-dasharray]="dashArray"
                  stroke-linecap="round"
                />
              </svg>
              <div
                class="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white"
              >
                {{ enrollment()?.progress }}%
              </div>
            </div>
          </div>
        </nav>
        <main class="flex-1 flex overflow-hidden min-h-0 relative">
          <!-- LEARNING CONTENT PANEL -->
          <div
            id="learning-content"
            class="flex-1 overflow-y-auto custom-scrollbar bg-[#030712] relative min-h-0"
          >
            @if (selectedStep(); as step) {
              <div
                class="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-10"
              >
                <header class="flex flex-col gap-4">
                  <button
                    (click)="selectedStep.set(null)"
                    class="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer border-none bg-transparent outline-none w-fit"
                  >
                    <svg
                      class="size-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="4"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to overview
                  </button>
                  <h2
                    class="text-md font-black text-white italic tracking-tighter uppercase leading-none"
                  >
                    {{ step.title }}
                  </h2>
                </header>

                <!-- QUIZ MODE -->
                @if (step.type === 'QUIZ') {
                  <div class="space-y-8">
                    @if (!quizSubmitted()) {
                      <div class="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 md:p-12">
                        <div class="flex items-center justify-between mb-8">
                          <span
                            class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]"
                            >Question {{ currentQuestionIndex() + 1 }} of
                            {{ step.quiz?.questions?.length }}</span
                          >
                          <div class="flex gap-2">
                            <button
                              (click)="prevQuestion()"
                              [disabled]="currentQuestionIndex() === 0"
                              class="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 cursor-pointer"
                            >
                              <svg
                                class="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="3"
                              >
                                <path d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              (click)="nextQuestion()"
                              [disabled]="
                                currentQuestionIndex() === (step.quiz?.questions?.length || 1) - 1
                              "
                              class="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 cursor-pointer"
                            >
                              <svg
                                class="size-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="3"
                              >
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        @if (
                          step.quiz?.questions && step.quiz!.questions[currentQuestionIndex()];
                          as q
                        ) {
                          <div class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <h3 class="text-sm font-bold text-white leading-tight">
                              {{ q.questionText }}
                            </h3>
                            <div class="grid grid-cols-1 gap-3">
                              @for (opt of q?.answerOptions; track opt.id) {
                                <button
                                  (click)="toggleAnswer(q.id, opt.id, !!q?.hasMultipleAnswers)"
                                  [class]="
                                    isOptionSelected(q.id, opt.id)
                                      ? 'bg-indigo-500/10 border-indigo-500 text-white'
                                      : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5'
                                  "
                                  class="flex items-center gap-4 p-6 rounded-2xl border text-left transition-all group cursor-pointer"
                                >
                                  <div
                                    class="size-4 rounded-lg border-2 flex items-center justify-center transition-all"
                                    [class]="
                                      isOptionSelected(q.id, opt.id)
                                        ? 'bg-indigo-500 border-indigo-500'
                                        : 'border-white/10'
                                    "
                                  >
                                    @if (isOptionSelected(q.id, opt.id)) {
                                      <svg
                                        class="size-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="4"
                                      >
                                        <path d="M5 13l4 4L19 7" />
                                      </svg>
                                    }
                                  </div>
                                  <span class="text-sm font-medium">{{ opt.answerText }}</span>
                                </button>
                              }
                            </div>
                          </div>
                        }

                        <!-- SUBMIT BUTTON - ONLY ON LAST QUESTION -->
                        @if (currentQuestionIndex() === (step.quiz?.questions?.length || 1) - 1) {
                          <div class="mt-12 flex justify-end">
                            <button
                              (click)="submitQuiz()"
                              [disabled]="!allQuestionsAnswered()"
                              class="px-10 py-4 bg-indigo-600 disabled:opacity-30 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20 cursor-pointer"
                            >
                              Submit Quiz
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <div
                        class="bg-white/2 border border-white/5 rounded-[2.5rem] p-12 text-center space-y-8 animate-in zoom-in-95 duration-500"
                      >
                        <div
                          class="size-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
                        >
                          <svg
                            class="size-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        <div class="space-y-2">
                          <h2
                            class="text-md font-black text-white italic tracking-tighter uppercase"
                          >
                            Quiz Attempted!
                          </h2>
                          <p class="text-slate-400 text-sm">
                            Congratulations! You've finished the quiz.
                          </p>
                        </div>

                        <div
                          class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                        >
                          <button
                            (click)="retakeQuiz()"
                            class="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      </div>
                      <footer
                        class="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8"
                      >
                        <!-- BACK BUTTON -->
                        <div class="flex-1 flex justify-start order-2 sm:order-1">
                          @if (previousStep(); as prev) {
                            <button
                              (click)="navigateToStep(prev)"
                              class="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                            >
                              <div
                                class="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors"
                              >
                                <svg
                                  class="size-3.5 text-slate-500 group-hover:text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="3"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                  />
                                </svg>
                              </div>
                              <div class="flex flex-col items-start">
                                <span
                                  class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                  >Previous</span
                                >
                                <span
                                  class="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors max-w-32 truncate italic"
                                >
                                  {{ prev.title }}
                                </span>
                              </div>
                            </button>
                          }
                        </div>

                        <!-- NEXT BUTTON -->
                        <div class="flex-1 flex justify-end order-3">
                          @if (nextStep(); as next) {
                            <button
                              (click)="navigateToStep(next)"
                              class="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10 text-right"
                            >
                              <div class="flex flex-col items-end">
                                <span
                                  class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                                  >Next</span
                                >
                                <span
                                  class="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors max-w-32 truncate italic"
                                >
                                  {{ next.title }}
                                </span>
                              </div>
                              <div
                                class="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors"
                              >
                                <svg
                                  class="size-3.5 text-slate-500 group-hover:text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="3"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                  />
                                </svg>
                              </div>
                            </button>
                          }
                        </div>
                      </footer>
                    }
                  </div>
                }

                <!-- LESSON MODE -->
                @if (step.type === 'LESSON') {
                  @if (step.videoPlaybackId) {
                    <section class="animate-in zoom-in-95 duration-700">
                      <div
                        class="aspect-video w-full rounded-4xl md:rounded-[3rem] border border-white/5 bg-black shadow-2xl overflow-hidden relative group"
                      >
                        <mux-player
                          [attr.playback-id]="step.videoPlaybackId"
                          primary-color="#6366f1"
                          secondary-color="#030712"
                          class="w-full h-full block"
                        ></mux-player>
                      </div>
                    </section>
                  }

                  @if (step.content) {
                    <section class="bg-white/2 border border-white/5 rounded-[2.5rem] p-6 md:p-10">
                      <div class="flex items-center gap-3 mb-8">
                        <div class="size-1.5 rounded-full bg-indigo-500"></div>
                        <span
                          class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                          >Lesson Content</span
                        >
                      </div>
                      <div
                        class="prose prose-invert max-w-none text-slate-400 leading-relaxed ql-editor wrap-break-word whitespace-pre-wrap"
                        [innerHTML]="sanitizer.bypassSecurityTrustHtml(step.content)"
                      ></div>
                    </section>
                  }

                  @if (step.resources && step.resources.length > 0) {
                    <section class="space-y-4">
                      <div class="flex items-center gap-3 px-2">
                        <div class="size-1.5 rounded-full bg-emerald-500"></div>
                        <span
                          class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
                          >Downloadable Resources</span
                        >
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @for (res of step.resources; track res.id) {
                          <a
                            [href]="res.s3PreSignedUrl"
                            target="_blank"
                            class="flex items-center justify-between p-6 bg-white/3 border border-white/5 rounded-3xl hover:bg-white/5 hover:border-indigo-500/30 transition-all group"
                          >
                            <div class="flex items-center gap-4 min-w-0">
                              <div
                                class="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"
                              >
                                <svg
                                  class="size-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <path
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div class="flex flex-col min-w-0">
                                <span
                                  class="text-xs font-bold text-white truncate uppercase tracking-tight"
                                  >{{ res.name }}</span
                                >
                                <span
                                  class="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5"
                                  >Cloud Asset</span
                                >
                              </div>
                            </div>
                            <svg
                              class="size-4 text-slate-600 group-hover:text-white transition-colors"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </a>
                        }
                      </div>
                    </section>
                  }
                  <footer
                    class="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8"
                  >
                    <!-- BACK BUTTON -->
                    <div class="flex-1 flex justify-start order-2 sm:order-1">
                      @if (previousStep(); as prev) {
                        <button
                          (click)="navigateToStep(prev)"
                          class="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10"
                        >
                          <div
                            class="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors"
                          >
                            <svg
                              class="size-3.5 text-slate-500 group-hover:text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                              />
                            </svg>
                          </div>
                          <div class="flex flex-col items-start">
                            <span
                              class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                              >Previous</span
                            >
                            <span
                              class="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors max-w-32 truncate italic"
                            >
                              {{ prev.title }}
                            </span>
                          </div>
                        </button>
                      }
                    </div>

                    <!-- CENTER: MARK AS COMPLETED -->
                    <div class="flex justify-center order-1 sm:order-2 w-full sm:w-auto">
                      <button
                        (click)="markAsCompleted()"
                        [disabled]="isProcessing() || selectedStep()?.progress?.isCompleted"
                        [class.bg-indigo-600]="!selectedStep()?.progress?.isCompleted"
                        [class.bg-emerald-500]="selectedStep()?.progress?.isCompleted"
                        class="px-10 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-3 min-w-52 justify-center border border-white/10"
                      >
                        @if (isProcessing()) {
                          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Updating...</span>
                        } @else if (selectedStep()?.progress?.isCompleted) {
                          <div class="flex items-center gap-2">
                            <svg
                              class="size-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Step Completed</span>
                          </div>
                        } @else {
                          <span>Mark as Completed</span>
                        }
                      </button>
                    </div>

                    <!-- NEXT BUTTON -->
                    <div class="flex-1 flex justify-end order-3">
                      @if (nextStep(); as next) {
                        <button
                          (click)="navigateToStep(next)"
                          class="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10 text-right"
                        >
                          <div class="flex flex-col items-end">
                            <span
                              class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                              >Next</span
                            >
                            <span
                              class="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors max-w-32 truncate italic"
                            >
                              {{ next.title }}
                            </span>
                          </div>
                          <div
                            class="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors"
                          >
                            <svg
                              class="size-3.5 text-slate-500 group-hover:text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                              />
                            </svg>
                          </div>
                        </button>
                      }
                    </div>
                  </footer>
                }
              </div>
            } @else {
              <!-- COURSE OVERVIEW -->
              <div class="p-6 md:p-12 max-w-5xl mx-auto animate-in fade-in duration-700">
                @if (enrollment()?.isCompleted) {
                  <div class="mb-12 group relative">
                    <div
                      class="absolute -inset-4 bg-linear-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-4xl blur-2xl opacity-100 transition-opacity"
                    ></div>

                    <div
                      class="relative bg-white/2 border border-indigo-500/20 rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl"
                    >
                      <div
                        class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16"
                      ></div>

                      <div class="flex items-center gap-5 relative z-10">
                        <div
                          class="size-14 rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500"
                        >
                          <svg
                            class="size-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="1.5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296a3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                            />
                          </svg>
                        </div>

                        <div class="flex flex-col gap-1">
                          <span
                            class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse"
                          >
                            Milestone Achieved
                          </span>
                          <p
                            class="text-slate-500 text-[10px] font-medium uppercase tracking-widest"
                          >
                            Your official certification is ready for issuance
                          </p>
                        </div>
                      </div>

                      @if (!enrollment()?.isRated) {
                        <button
                          (click)="openRatingModal()"
                          class="px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Rate Experience
                        </button>
                      }

                      <button
                        (click)="claimCertificate()"
                        [disabled]="isProcessing()"
                        class="relative z-10 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-white/10 
         hover:bg-indigo-50 hover:scale-105 active:scale-95 
         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                      >
                        @if (isProcessing()) {
                          <span class="flex items-center gap-2">
                            <svg class="animate-spin h-3 w-3 text-black" viewBox="0 0 24 24">
                              <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                                fill="none"
                              ></circle>
                              <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        } @else {
                          Claim Certificate
                        }
                      </button>
                    </div>

                    <!-- Rating Stars & Feedback Input -->
                  </div>
                } @else {
                  @if (lastActivity(); as last) {
                    <div class="mb-12 group relative cursor-pointer" (click)="selectStep(last)">
                      <div
                        class="absolute -inset-4 bg-indigo-500/5 rounded-4xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      ></div>
                      <div
                        class="relative bg-white/2 border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div class="flex items-center gap-5">
                          <div
                            class="size-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xl shadow-white/5 group-hover:scale-105 transition-transform"
                          >
                            <svg class="size-4 text-black ml-0.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <div class="flex flex-col gap-1">
                            <span
                              class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em]"
                            >
                              {{ enrollment()?.lastLearningStepId ? 'Resume Activity' : 'Up Next' }}
                            </span>
                            <h2
                              class="text-sm md:text-sm font-black text-white uppercase italic tracking-tighter leading-tight"
                            >
                              {{ last.title }}
                            </h2>
                          </div>
                        </div>
                        <button
                          class="px-5 py-2 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-md hover:bg-white hover:text-black transition-all w-fit cursor-pointer"
                        >
                          {{ enrollment()?.lastLearningStepId ? 'Continue' : 'Start Learning' }}
                        </button>
                      </div>
                    </div>
                  }
                }

                <section class="flex flex-col gap-6">
                  <h1
                    class="text-md md:text-md font-black text-white uppercase italic tracking-tighter leading-tight"
                  >
                    {{ enrollment()?.course?.title }}
                  </h1>
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md"
                      >{{ enrollment()?.course?.modules?.length || 0 }} Modules</span
                    >
                    <span
                      class="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-md"
                      >{{ totalStepsCount() }} Steps</span
                    >
                    <span
                      class="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-500 uppercase tracking-widest rounded-md"
                      >{{ enrollment()?.progress }}% Completed</span
                    >
                  </div>
                  <div
                    class="ql-editor prose prose-invert max-w-none text-slate-400 leading-relaxed wrap-break-word whitespace-pre-wrap"
                    [innerHTML]="safeDescription"
                  ></div>
                </section>
              </div>
            }
          </div>

          <!-- SIDEBAR -->
          <aside
            [class.translate-x-0]="sidebarVisible()"
            [class.translate-x-full]="!sidebarVisible()"
            [class.lg:w-96]="sidebarVisible()"
            [class.lg:w-0]="!sidebarVisible()"
            class="absolute lg:relative top-0 right-0 h-full bg-[#030712] border-l border-white/5 flex flex-col shrink-0 min-h-0 transition-transform lg:transition-all duration-500 ease-in-out z-110 lg:z-10 shadow-2xl lg:shadow-none w-full lg:w-96"
          >
            <!-- Tabs -->
            <div class="flex border-b border-white/5 bg-[#030712]/80 backdrop-blur-md shrink-0">
              <button
                (click)="activeTab.set('content')"
                class="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative"
                [class]="
                  activeTab() === 'content' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                "
              >
                Content
                @if (activeTab() === 'content') {
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                }
              </button>
              <button
                (click)="activeTab.set('assistant')"
                class="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative"
                [class]="
                  activeTab() === 'assistant' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                "
              >
                AI Tutor
                @if (activeTab() === 'assistant') {
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                }
              </button>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 overflow-x-hidden">
              @if (activeTab() === 'content') {
                <div class="divide-y divide-white/5 animate-in fade-in duration-300">
                  @for (module of enrollment()?.course?.modules; track module.id; let i = $index) {
                    <div class="group">
                      <button
                        (click)="toggleModule(module.id)"
                        class="w-full p-6 flex items-center justify-between hover:bg-white/3 transition-all text-left outline-none border-none cursor-pointer"
                      >
                        <div class="flex items-center gap-4">
                          <span
                            class="text-sm font-black italic transition-colors"
                            [class]="isExpanded(module.id) ? 'text-indigo-500' : 'text-white/10'"
                            >0{{ i + 1 }}</span
                          >
                          <span class="text-[11px] font-bold text-white uppercase tracking-tight">{{
                            module.title
                          }}</span>
                        </div>
                        <svg
                          class="size-4 text-slate-600 transition-transform duration-500"
                          [class.rotate-180]="isExpanded(module.id)"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path stroke-width="3" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div
                        class="overflow-hidden transition-all duration-500 ease-in-out"
                        [style.max-height]="isExpanded(module.id) ? '2000px' : '0px'"
                      >
                        <div class="bg-white/2 pb-4">
                          @for (step of module.learningSteps; track step.id) {
                            <div
                              (click)="selectStep(step)"
                              class="group/step flex items-center justify-between px-8 py-4 hover:bg-indigo-500/5 cursor-pointer transition-all border-l-2 border-transparent"
                              [class.border-indigo-500]="selectedStep()?.id === step.id"
                            >
                              <div class="flex items-center gap-4">
                                <div
                                  class="size-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0"
                                  [class]="
                                    step?.progress?.isCompleted
                                      ? 'bg-indigo-500 border-indigo-500'
                                      : 'border-white/10 group-hover/step:border-indigo-500'
                                  "
                                >
                                  @if (step?.progress?.isCompleted) {
                                    <svg
                                      class="size-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      stroke-width="4"
                                    >
                                      <path d="M5 13l4 4L19 7" />
                                    </svg>
                                  }
                                </div>
                                <span
                                  class="text-[11px] font-bold tracking-tight transition-colors"
                                  [class]="
                                    selectedStep()?.id === step.id
                                      ? 'text-white'
                                      : 'text-slate-400 group-hover/step:text-white'
                                  "
                                  >{{ step.title }}</span
                                >
                              </div>
                              <span class="text-[8px] font-black text-slate-700 uppercase italic">{{
                                step.type
                              }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="p-6 space-y-6 animate-in fade-in duration-300">
                  <div class="flex gap-4">
                    <div
                      class="size-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0"
                    >
                      <svg
                        class="size-4 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                    </div>
                    <div class="space-y-2">
                      <p class="text-xs font-bold text-white uppercase tracking-tight">
                        Learning Assistant
                      </p>
                      <div
                        class="bg-white/5 border border-white/5 rounded-2xl p-4 text-[13px] text-slate-300 leading-relaxed"
                      >
                        Hi! I'm your AI tutor. Ask me anything about the
                        <span class="font-bold text-indigo-700">{{
                          enrollment()?.course?.title
                        }}</span>
                        course.
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            @if (activeTab() === 'assistant') {
              <div class="p-6 bg-[#030712] border-t border-white/5 shrink-0">
                <div class="relative group w-full">
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    class="absolute right-2 top-1.5 size-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-400 transition-colors cursor-pointer"
                  >
                    <svg
                      class="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </aside>

          @if (showResultsModal()) {
            <div
              class="absolute inset-0 z-140 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300"
            >
              <div
                class="bg-[#030712] border border-white/5 w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2.5rem] flex flex-col shadow-2xl"
              >
                <div class="p-8 md:p-10 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h2 class="text-md font-black text-white uppercase italic tracking-tighter">
                      {{ quizResult()?.passed ? 'Quiz Passed' : 'Quiz Failed' }}
                    </h2>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      You scored {{ quizResult()?.score }}% — {{ quizResult()?.correctCount }} of
                      {{ quizResult()?.totalQuestions }} correct
                    </p>
                  </div>

                  <button
                    (click)="showResultsModal.set(false)"
                    class="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg
                      class="size-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div
                  class="px-10 py-4 border-b border-white/5 text-center"
                  [class]="quizResult()?.passed ? 'bg-emerald-500/5' : 'bg-red-500/5'"
                >
                  <p
                    class="text-[10px] font-black uppercase tracking-widest"
                    [class]="quizResult()?.passed ? 'text-emerald-500' : 'text-red-500'"
                  >
                    {{
                      quizResult()?.passed
                        ? 'Passing score reached! You can proceed to the next lesson or retake the quiz to improve your score.'
                        : 'You did not reach the passing score. Please review the answers below.'
                    }}
                  </p>
                </div>

                <div class="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  @for (result of quizResult()?.evaluatedAnswers; track $index) {
                    <div class="space-y-4">
                      <div class="flex items-start justify-between gap-6">
                        <div class="flex gap-4">
                          <span class="text-indigo-500 font-black text-sm mt-0.5"
                            >{{ $index + 1 }}.</span
                          >
                          <p class="text-md font-medium text-slate-200 leading-relaxed">
                            {{ result.questionText }}
                          </p>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                          <span
                            class="text-[9px] font-black uppercase tracking-tighter"
                            [class]="result.isCorrect ? 'text-emerald-500' : 'text-red-500'"
                          >
                            {{ result.isCorrect ? 'Correct' : 'Incorrect' }}
                          </span>
                          <div
                            class="size-1.5 rounded-full"
                            [class]="result.isCorrect ? 'bg-emerald-500' : 'bg-red-500'"
                          ></div>
                        </div>
                      </div>

                      <div class="ml-10 flex items-center gap-3">
                        <div
                          class="size-4 rounded border flex items-center justify-center shrink-0"
                          [class]="
                            result.isCorrect
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'bg-red-500 border-red-500'
                          "
                        >
                          <svg
                            class="size-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="4"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span class="text-sm text-slate-400">{{
                          result.selectedOptions.join(', ') || 'No answer'
                        }}</span>
                      </div>

                      @if (!result.isCorrect) {
                        <div class="ml-10 p-5 rounded-2xl bg-white/3 border border-white/5">
                          <p
                            class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1"
                          >
                            Correct Answer
                          </p>
                          <p class="text-sm text-slate-300">
                            {{ result.correctOptions.join(', ') }}
                          </p>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div
                  class="p-6 md:p-8 bg-white/2 border-t border-white/5 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0"
                >
                  <button
                    (click)="retakeQuiz()"
                    class="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Retake Quiz
                  </button>

                  <button
                    (click)="showResultsModal.set(false)"
                    class="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          }

          @if (showRatingModal()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <!-- Backdrop with heavy blur for focus -->
              <div
                class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                (click)="closeRatingModal()"
              ></div>

              <!-- Modal Content: Dark Slate/Indigo Theme -->
              <div
                class="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
              >
                <!-- Subtle Decorative Glow -->
                <div
                  class="absolute -top-24 -right-24 size-48 bg-indigo-500/10 blur-3xl rounded-full"
                ></div>

                <div class="relative z-10 flex flex-col items-center text-center gap-8">
                  <!-- Header -->
                  <div class="flex flex-col items-center gap-1">
                    <h2
                      class="text-white text-xs font-black uppercase italic tracking-tighter leading-tight"
                    >
                      Rating & Feedback
                    </h2>
                  </div>

                  <!-- Star Rating: Balanced Spacing -->
                  <div class="flex items-center gap-3">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <button
                        (click)="setRating(star)"
                        class="group cursor-pointer transition-transform active:scale-90 outline-none"
                      >
                        <svg
                          [class]="
                            star <= currentRating()
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-700'
                          "
                          class="size-9 transition-all duration-300 group-hover:scale-110"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Feedback Input -->
                  <div class="w-full space-y-2">
                    <label
                      class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left ml-2"
                    >
                      Additional Thoughts
                      <span class="text-slate-700 italic lowercase font-medium">(Optional)</span>
                    </label>
                    <textarea
                      [(ngModel)]="feedbackText"
                      class="custom-scrollbar w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 min-h-32 transition-colors resize-none"
                      placeholder="Tell us what you liked or what could be improved..."
                    >
                    </textarea>
                  </div>

                  <!-- Action Buttons: Unified Widths -->
                  <div class="flex flex-col w-full gap-3">
                    <button
                      (click)="submitRating()"
                      [disabled]="currentRating() === 0 || isSubmitting()"
                      class="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      {{ isSubmitting() ? 'Loading...' : 'Submit Review' }}
                    </button>

                    <button
                      (click)="closeRatingModal()"
                      class="w-full py-4 bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </main>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      ::ng-deep main:has(app-enrollment-view) {
        overflow: hidden !important;
        max-height: 100vh !important;
        padding: 0 !important;
      }
      .custom-scrollbar {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .ql-editor {
        line-height: 1.7;
        font-size: 14px;
      }

      /* Target the textarea within your modal specifically */
      textarea.custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      textarea.custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      textarea.custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.2); /* Subtle Indigo */
        border-radius: 20px;
      }

      textarea.custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.4); /* Brighter on hover */
      }
    `,
  ],
})
export class EnrollmentViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enrollmentService = inject(EnrollmentService);
  private notificationService = inject(NotificationService);
  public sanitizer = inject(DomSanitizer);
  private ratingService = inject(RatingService);

  enrollment = signal<EnrollmentResponse | null>(null);
  isLoading = signal(true);
  selectedStep = signal<LearningStepResponse | null>(null);
  expandedModuleIds = signal<Set<string>>(new Set());
  activeTab = signal<'content' | 'assistant'>('content');
  sidebarVisible = signal(true);
  quizResult = signal<QuizAttemptResponse | null>(null);

  // Quiz State
  currentQuestionIndex = signal(0);
  userAnswers = signal<Map<string, string[]>>(new Map());
  quizSubmitted = signal(false);

  safeDescription: SafeHtml = '';
  private destroy$ = new Subject<void>();

  totalStepsCount = computed(
    () =>
      this.enrollment()?.course?.modules?.reduce(
        (acc, mod) => acc + (mod.learningSteps?.length || 0),
        0,
      ) || 0,
  );

  completedStepsCount = computed(() => {
    let count = 0;
    this.enrollment()?.course?.modules?.forEach((mod) => {
      count += mod.learningSteps?.filter((s) => s?.progress?.isCompleted).length || 0;
    });
    return count;
  });

  lastActivity = computed(() => {
    const enrollment = this.enrollment();
    if (!enrollment || !enrollment.course.modules) return null;

    // 1. Create a flat, sorted list of all steps in the course
    const allStepsSorted = enrollment.course.modules
      .sort((a, b) => a.sequence - b.sequence) // Sort Modules first
      .flatMap(
        (m) => m.learningSteps.sort((a, b) => a.sequence - b.sequence), // Sort Steps within module
      );

    if (allStepsSorted.length === 0) return null;

    // 2. If no progress, start at the beginning
    const lastId = enrollment.lastLearningStepId;
    if (!lastId) return allStepsSorted[0];

    // 3. Find current step index in the sorted timeline
    const currentIndex = allStepsSorted.findIndex((s) => s.id === lastId);

    // 4. Return index + 1 (The next sequence)
    if (currentIndex !== -1 && currentIndex < allStepsSorted.length - 1) {
      return allStepsSorted[currentIndex + 1];
    }

    // 5. If it's the last step of the last module, return the last step
    return allStepsSorted[allStepsSorted.length - 1];
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        filter((id) => !!id),
        takeUntil(this.destroy$),
      )
      .subscribe((id) => this.loadEnrollment(id!));

    if (window.innerWidth < 1024) {
      this.sidebarVisible.set(false);
    }
  }

  private loadEnrollment(id: string, silent = false) {
    if (!silent) this.isLoading.set(true);
    this.enrollmentService
      .getEnrollmentById(id)
      .pipe(
        finalize(() => {
          if (!silent) this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          const cleanDesc = (data.course.description || '').replace(/\u00a0/g, ' ');
          this.enrollment.set(data);
          this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(cleanDesc);

          const currentlySelected = this.selectedStep();
          if (currentlySelected) {
            const freshStep = data.course.modules
              .flatMap((m) => m.learningSteps)
              .find((s) => s.id === currentlySelected.id);

            if (freshStep) {
              this.selectedStep.set(freshStep);
            }
          }

          if (data.course.modules?.length > 0) {
            this.expandRelevantModule(data);
          }
        },
        error: () => this.notificationService.error('Failed to load course'),
      });
  }
  selectStep(step: LearningStepResponse) {
    this.selectedStep.set(step);

    // Always reset quiz UI state when switching steps
    this.currentQuestionIndex.set(0);
    this.userAnswers.set(new Map());
    this.quizSubmitted.set(!!step?.progress?.isCompleted);

    if (window.innerWidth < 1024) this.sidebarVisible.set(false);
    document.getElementById('learning-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Quiz Methods
  toggleAnswer(questionId: string, optionId: string, multiple: boolean) {
    this.userAnswers.update((prev) => {
      const next = new Map(prev);
      let current = next.get(questionId) || [];
      if (multiple) {
        current = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        current = [optionId];
      }
      next.set(questionId, current);
      return next;
    });
  }

  isOptionSelected = (qId: string, oId: string) =>
    this.userAnswers().get(qId)?.includes(oId) ?? false;

  nextQuestion() {
    const questions = this.selectedStep()?.quiz?.questions || [];
    if (this.currentQuestionIndex() < questions.length - 1) {
      this.currentQuestionIndex.update((v) => v + 1);
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((v) => v - 1);
    }
  }

  allQuestionsAnswered(): boolean {
    const questions = this.selectedStep()?.quiz?.questions || [];
    return (
      questions.length > 0 &&
      questions.every((q) => (this.userAnswers().get(q.id)?.length || 0) > 0)
    );
  }

  toggleModule(id: string) {
    this.expandedModuleIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded = (id: string) => this.expandedModuleIds().has(id);

  get dashArray(): string {
    const p = this.enrollment()?.progress ?? 0;
    const circ = 2 * Math.PI * 16;
    return `${(p / 100) * circ}, ${circ}`;
  }

  goBack() {
    this.router.navigate(['/learner/enrollments']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isProcessing = signal(false);

  markAsCompleted() {
    const currentEnrollment = this.enrollment();
    const currentStep = this.selectedStep();

    // Guard: Don't run if already processing or if data is missing
    if (this.isProcessing() || !currentEnrollment || !currentStep) return;

    this.isProcessing.set(true);

    this.enrollmentService.markStepComplete(currentEnrollment.id, currentStep.id).subscribe({
      next: () => {
        this.notificationService.success('Step marked as completed');

        this.enrollmentService
          .getEnrollmentById(currentEnrollment.id)
          .pipe(finalize(() => this.isProcessing.set(false))) // Reset processing state after completion
          .subscribe({
            next: (freshEnrollment) => {
              this.enrollment.set(freshEnrollment);

              const updatedStep = freshEnrollment.course.modules
                .flatMap((m) => m.learningSteps)
                .find((s) => s.id === currentStep.id);

              if (updatedStep) {
                this.selectedStep.set(updatedStep);
              }
            },
          });
      },
      error: (err) => {
        this.isProcessing.set(false); // Reset on error
        this.notificationService.error(err?.error?.detail || 'Failed to mark step as completed');
        console.error(err);
      },
    });
  }

  showResultsModal = signal(false);

  submitQuiz() {
    const currentEnrollment = this.enrollment();
    const step = this.selectedStep();

    if (this.isProcessing() || !currentEnrollment || !step || !this.allQuestionsAnswered()) return;

    this.isProcessing.set(true);

    const payload: QuizAttemptRequest = {
      quizId: step.quiz?.id ?? '',
      selectedAnswers: Array.from(this.userAnswers().entries()).map(([qId, aIds]) => ({
        questionId: qId,
        selectedAnswerIds: aIds, // Already an array of strings (UUIDs)
      })),
    };

    this.enrollmentService
      .submitQuiz(currentEnrollment.id, step.id, payload)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (response) => {
          // Update UI with backend evaluation
          this.quizResult.set(response);
          this.quizSubmitted.set(true);
          this.showResultsModal.set(true);

          if (response.passed) {
            this.notificationService.success('Quiz Passed!');
            this.loadEnrollment(currentEnrollment.id);
          } else {
            this.notificationService.error('Quiz Failed. Review your answers and try again.');
          }
        },
        error: (err) => {
          this.notificationService.error(err?.error?.detail || 'Failed to submit quiz');
          console.error('Quiz error:', err);
        },
      });
  }

  retakeQuiz() {
    const currentStep = this.selectedStep();

    this.quizSubmitted.set(false);
    this.showResultsModal.set(false);
    this.quizResult.set(null);
    this.currentQuestionIndex.set(0);
    this.userAnswers.set(new Map());

    // Force refresh the step from latest enrollment data
    if (currentStep) {
      const freshEnrollment = this.enrollment();
      if (freshEnrollment) {
        const freshStep = freshEnrollment.course.modules
          .flatMap((m) => m.learningSteps)
          .find((s) => s.id === currentStep.id);

        if (freshStep) {
          this.selectedStep.set(freshStep);
        }
      }
    }
  }

  private expandRelevantModule(enrollment: EnrollmentResponse) {
    const modules = enrollment.course?.modules || [];
    if (modules.length === 0) return;

    // 1. If we have a selected step, expand its module
    const currentStep = this.selectedStep();
    if (currentStep) {
      const moduleWithStep = modules.find((m) =>
        m.learningSteps?.some((s) => s.id === currentStep.id),
      );
      if (moduleWithStep && !this.isExpanded(moduleWithStep.id)) {
        this.toggleModule(moduleWithStep.id);
        return;
      }
    }

    // 2. Otherwise expand first module only if none are expanded
    const firstModule = modules[0];
    if (this.expandedModuleIds().size === 0 && !this.isExpanded(firstModule.id)) {
      this.toggleModule(firstModule.id);
    }
  }

  certificate = signal<CertificateResponse | null>(null);

  public claimCertificate(): void {
    const enrollmentId = this.enrollment()?.id;
    if (!enrollmentId || this.isProcessing()) return;

    this.isProcessing.set(true);

    this.enrollmentService.claimCertificate(enrollmentId).subscribe({
      next: (certificate: CertificateResponse) => {
        // 3. Navigate to the certificate view or open the RustFS URL directly
        window.open(certificate.certificateUrl, '_blank');
        this.isProcessing.set(false);
      },
      error: (err: any) => {
        this.isProcessing.set(false);
        console.error('Certificate issuance failed', err);
        this.notificationService.error('Failed to claim certificate');
      },
    });
  }

  // 1. Unified Source of Truth for Order
  allSteps = computed(() => {
    const enrollment = this.enrollment();
    if (!enrollment?.course?.modules) return [];

    return [...enrollment.course.modules]
      .sort((a, b) => a.sequence - b.sequence) // Sort Modules
      .flatMap(
        (m) => [...m.learningSteps].sort((a, b) => a.sequence - b.sequence), // Sort Steps inside
      );
  });

  // 2. Current Index - The "Anchor"
  currentIndex = computed(() => {
    const steps = this.allSteps();
    const current = this.selectedStep();
    if (!current || steps.length === 0) return -1;
    return steps.findIndex((s) => s.id === current.id);
  });

  // 3. Navigation Signals
  previousStep = computed(() => {
    const idx = this.currentIndex();
    return idx > 0 ? this.allSteps()[idx - 1] : null;
  });

  nextStep = computed(() => {
    const idx = this.currentIndex();
    const steps = this.allSteps();
    return idx !== -1 && idx < steps.length - 1 ? steps[idx + 1] : null;
  });

  navigateToStep(step: LearningStepResponse) {
    this.selectStep(step);
  }

  showRatingModal = signal<boolean>(false);
  currentRating = signal<number>(0);
  isSubmitting = signal<boolean>(false);
  feedbackText: string = '';

  openRatingModal(): void {
    this.currentRating.set(0);
    this.feedbackText = '';
    this.showRatingModal.set(true);
  }

  closeRatingModal(): void {
    this.showRatingModal.set(false);
  }

  setRating(val: number): void {
    this.currentRating.set(val);
  }

  submitRating(): void {
    if (this.currentRating() === 0 || this.isSubmitting()) return;

    const enrollment = this.enrollment();
    if (!enrollment) {
      this.notificationService.info('Enrollment data not available');
      return;
    }

    this.isSubmitting.set(true);

    const request: RatingRequest = {
      enrollmentId: enrollment.id,
      courseId: enrollment.course.id,
      rating: this.currentRating(),
      comment: this.feedbackText?.trim() || '',
    };

    this.ratingService.submitRating(request).subscribe({
      next: () => {
        this.closeRatingModal();
        this.notificationService.success('Thank you for your feedback!');

        this.enrollmentService
          .getEnrollmentById(enrollment.id)
          .pipe(
            repeat({ delay: 500 }), // Request every 0.5s
            filter((data) => data.isRated), // Wait until isRated is true
            take(1), // Stop polling immediately
            timeout(5000), // Stop after 5s if Kafka hangs
          )
          .subscribe({
            next: () => {
              this.isSubmitting.set(false); // Kill the submitting spinner
              this.loadEnrollment(enrollment.id, true); // Load data SILENTLY
            },
            error: () => {
              this.isSubmitting.set(false);
              this.loadEnrollment(enrollment.id); // Final fallback
            },
          });
      },
      error: (err: any) => {
        console.error('Rating submission failed:', err);
        this.notificationService.error('Failed to submit your rating');
        this.isSubmitting.set(false);
      },
    });
  }
}
