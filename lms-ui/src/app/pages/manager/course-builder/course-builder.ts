import {
  Component,
  signal,
  inject,
  OnInit,
  HostListener,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CourseResponse, CourseService } from '../../../services/course.service';
import { finalize, firstValueFrom, map } from 'rxjs';
import { CategoryService, CourseCategoryResponse } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  ModuleDetailsUpdate,
  ModuleRequest,
  ModuleResponse,
  ModuleService,
} from '../../../services/module.service';
import {
  LearningStepResource,
  LearningStepRequest,
  LearningStepResponse,
  LearningStepService,
  LearningStepUpdateRequest,
  QuizQuestionRequest,
} from '../../../services/learning-step.service';
import { MuxService } from '../../../services/mux.service';
import { S3Service } from '../../../services/s3.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import Keycloak from 'keycloak-js';
import { NotificationService } from '../../../services/notification.service';

type StudioView = 'COURSE_IDENTITY' | 'MODULE_STRUCTURE' | 'LESSON_EDITOR' | 'QUIZ_EDITOR';

@Component({
  selector: 'app-course-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, DragDropModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      class="flex flex-col w-full h-full bg-[#030712] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30"
    >
      @if (isLoading()) {
        <div class="fixed inset-0 z-110 bg-[#030712] flex flex-col items-center justify-center">
          <div class="flex flex-col items-center gap-6">
            <div class="relative flex items-center justify-center">
              <div
                class="size-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 animate-pulse"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="size-8 text-indigo-500 animate-spin" viewBox="0 0 24 24" fill="none">
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
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <span
                class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 animate-pulse"
              >
                Synchronizing Studio
              </span>
              <span class="text-[9px] text-slate-500 italic tracking-widest">
                Building curriculum architecture...
              </span>
            </div>
          </div>
        </div>
      }
      <nav
        class="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-[#030712] shrink-0 z-20"
      >
        <div class="flex items-center gap-2">
          <button
            (click)="router.navigate(['/manager/courses'])"
            class="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-indigo-400"
            title="Go back to courses"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex flex-col justify-center border-l border-white/10 pl-3 ml-1">
            <span
              class="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 leading-none"
            >
              Course Builder
            </span>
            <span
              class="text-xs lg:text-sm font-bold text-white truncate max-w-32 lg:max-w-64 mt-1"
            >
              {{ courseData().title || 'Untitled Course' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          @if (isCoursePublished()) {
            <!-- ✅ PUBLISHED STATE -->
            <div
              class="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
            >
              <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                Published
              </span>
            </div>
          } @else if (isReadyToPublish()) {
            <!-- Ready to Publish -->
            <button
              (click)="publishCourse()"
              [disabled]="isPublishingCourse()"
              class="group flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (isPublishingCourse()) {
                <span
                  class="size-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
                ></span>
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-white"
                >
                  Publishing...
                </span>
              } @else {
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-white"
                >
                  Publish Course
                </span>
                <svg
                  class="size-3 text-emerald-500 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              }
            </button>
          } @else {
            <!-- Draft Mode -->
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
              Draft Mode
            </span>
          }
        </div>
      </nav>
      <div class="flex-1 flex overflow-hidden relative">
        <aside
          [class.translate-x-0]="isSidebarOpen()"
          [class.-translate-x-full]="!isSidebarOpen()"
          class="absolute lg:relative inset-y-0 left-0 w-72 lg:translate-x-0 lg:w-80 border-r border-white/5 bg-[#030712] flex flex-col shrink-0 z-40 lg:z-10 transition-transform duration-300 shadow-2xl lg:shadow-none"
        >
          <div class="p-6 shrink-0">
            <button
              (click)="setView('COURSE_IDENTITY'); isSidebarOpen.set(false)"
              [class.bg-white/5]="activeView() === 'COURSE_IDENTITY'"
              class="group flex items-center gap-3 w-full p-4 rounded-2xl transition-all cursor-pointer hover:bg-white/5"
            >
              <div
                class="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"
              >
                <svg
                  class="size-4 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <div class="text-left">
                <p
                  class="text-[11px] font-black uppercase tracking-widest"
                  [class.text-indigo-400]="activeView() === 'COURSE_IDENTITY'"
                >
                  Course Details
                </p>
                <p class="text-[10px] text-slate-500 font-medium italic">Basics & pricing</p>
              </div>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-10">
            <div class="flex items-center justify-between px-2 mb-4">
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest"
                >Course Content</span
              >
              <button
                (click)="addModule()"
                class="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-tighter cursor-pointer"
              >
                + Add Module
              </button>
            </div>

            <div class="space-y-3">
              @for (module of modules(); track module.id) {
                <div class="group/mod bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
                  <button
                    (click)="selectModule(module); isSidebarOpen.set(false)"
                    class="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors cursor-pointer text-left"
                  >
                    <span
                      class="text-xs font-bold truncate max-w-75"
                      [class.text-indigo-400]="selectedModuleId() === module.id"
                    >
                      {{ module.title }}
                    </span>

                    <svg
                      (click)="toggleModuleStructure(module.id, $event)"
                      class="size-3.5 text-slate-600 transition-transform duration-200"
                      [class.rotate-180]="expandedModuleIds().has(module.id)"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-width="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  @if (expandedModuleIds().has(module.id)) {
                    <div class="bg-black/20 px-2 pb-2 space-y-1">
                      @for (step of module.learningSteps; track step.id) {
                        <button
                          (click)="selectStep(step); isSidebarOpen.set(false)"
                          [class.bg-indigo-500/10]="selectedStepId() === step.id"
                          class="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-3 cursor-pointer"
                        >
                          <div
                            class="size-1.5 rounded-full"
                            [class.bg-amber-500]="step.type === 'QUIZ'"
                            [class.bg-indigo-500]="step.type === 'LESSON'"
                          ></div>
                          <span class="truncate">{{ step.title }}</span>
                        </button>
                      } @empty {
                        <p class="text-[10px] text-slate-500 px-3 py-2 italic">No steps yet</p>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </aside>

        <main class="flex-1 overflow-y-auto bg-[#030712] relative custom-scrollbar z-10">
          <div class="lg:hidden sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md px-6 py-5">
            <div class="flex items-center gap-6">
              <button
                (click)="isSidebarOpen.set(true)"
                class="flex items-center justify-center text-slate-500 active:text-indigo-400 transition-colors cursor-pointer"
              >
                <svg
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M3 8h12M3 16h18" stroke-linecap="round" />
                </svg>
              </button>

              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    class="text-[7px] font-black uppercase tracking-[0.4em] text-indigo-500/80 leading-none"
                  >
                    {{ activeView() === 'LESSON_EDITOR' ? 'Editing' : 'Workspace' }}
                  </span>
                  <div class="size-1 rounded-full bg-indigo-500/40"></div>
                </div>

                <h2
                  class="text-[11px] font-bold text-slate-300 truncate uppercase italic tracking-widest leading-none"
                >
                  {{
                    activeView() === 'COURSE_IDENTITY'
                      ? 'Course Identity'
                      : activeView() === 'MODULE_STRUCTURE'
                        ? getSelectedModule()?.title
                        : getSelectedStep()?.title
                  }}
                </h2>
              </div>
            </div>
          </div>
          <div class="max-w-4xl mx-auto py-8 lg:py-16 px-4 md:px-12 pb-32 lg:pb-16">
            @if (activeView() === 'COURSE_IDENTITY') {
              <div class="space-y-8 lg:space-y-10 pb-32">
                <div class="flex justify-center mb-12">
                  <div
                    class="inline-flex p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md"
                  >
                    <button
                      (click)="identityTab.set('DETAILS')"
                      [class]="
                        identityTab() === 'DETAILS'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-200'
                      "
                      class="flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        class="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Course Details
                    </button>

                    <button
                      (click)="identityTab.set('STRUCTURE')"
                      [class]="
                        identityTab() === 'STRUCTURE'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-200'
                      "
                      class="flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        class="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Curriculum Structure
                    </button>
                  </div>
                </div>

                @if (identityTab() === 'DETAILS') {
                  <div
                    class="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-12 lg:space-y-16"
                  >
                    <header>
                      <h2
                        class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2"
                      >
                        Course Details
                      </h2>
                      <p class="text-slate-500 text-sm font-medium mt-2">
                        Provide the general info and pricing.
                      </p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                      <div class="space-y-3 col-span-1 md:col-span-2">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Course title</label
                        >
                        <input
                          type="text"
                          [(ngModel)]="courseData().title"
                          (ngModelChange)="updateSlug()"
                          placeholder="What is this course about?"
                          [class.border-rose-500/40]="showValidationErrors && !courseData().title"
                          class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-md lg:text-md text-white outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-800"
                        />
                        @if (showValidationErrors && !courseData().title) {
                          <span
                            class="text-[11px] text-rose-500 font-black uppercase tracking-widest ml-1 italic"
                            >Title is required</span
                          >
                        }
                      </div>

                      <div class="space-y-3">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Slug</label
                        >
                        <input
                          type="text"
                          [(ngModel)]="courseData().slug"
                          readonly
                          class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-indigo-400 outline-none font-mono text-xs cursor-default"
                        />
                      </div>

                      <div class="space-y-3">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Category</label
                        >
                        <div class="relative">
                          <div
                            (click)="toggleDropdown($event)"
                            [class.border-rose-500/40]="
                              showValidationErrors && !courseData().categoryId
                            "
                            class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 text-sm font-bold text-white cursor-pointer flex items-center justify-between hover:bg-white/10 transition-all"
                          >
                            <span>{{ selectedCategoryName() || 'Select category' }}</span>
                            <svg
                              class="size-4 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          @if (showValidationErrors && !courseData().categoryId) {
                            <span
                              class="text-[11px] text-rose-500 font-black uppercase tracking-widest ml-1 italic"
                              >Category selection is required</span
                            >
                          }
                          @if (isDropdownOpen()) {
                            <div
                              class="absolute top-full left-0 w-full mt-2 bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                              @for (cat of categories(); track cat.id) {
                                <div
                                  (click)="selectCategory(cat)"
                                  class="px-5 py-4 text-sm font-bold text-slate-300 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                >
                                  {{ cat.name }}
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>

                      <div class="space-y-3">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Access Type</label
                        >
                        <div
                          class="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 h-15 lg:h-17.5"
                        >
                          <button
                            (click)="setTier('FREE')"
                            [class.bg-indigo-600]="courseData().tier === 'FREE'"
                            class="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Free
                          </button>
                          <button
                            (click)="setTier('PREMIUM')"
                            [class.bg-indigo-600]="courseData().tier === 'PREMIUM'"
                            class="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Paid
                          </button>
                        </div>
                      </div>

                      <div class="space-y-3">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Course Price</label
                        >
                        <div
                          [class.border-rose-500/40]="
                            showValidationErrors &&
                            courseData().tier === 'PREMIUM' &&
                            (!courseData().price || courseData().price <= 0)
                          "
                          class="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-all h-15 lg:h-17.5"
                        >
                          <span class="pl-5 text-slate-500 text-lg font-bold select-none">$</span>
                          <input
                            type="number"
                            [(ngModel)]="courseData().price"
                            [readonly]="courseData().tier === 'FREE'"
                            class="w-full bg-transparent px-4 text-lg text-white outline-none font-bold disabled:opacity-20"
                          />
                        </div>
                        @if (
                          showValidationErrors &&
                          courseData().tier === 'PREMIUM' &&
                          (!courseData().price || courseData().price <= 0)
                        ) {
                          <span
                            class="text-[11px] text-rose-500 font-black uppercase tracking-widest ml-1 italic"
                            >Paid courses require price > 0</span
                          >
                        }
                      </div>

                      <div class="col-span-1 md:col-span-2 space-y-3">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >#Tags</label
                        >
                        <div
                          [class.border-rose-500/40]="
                            showValidationErrors && courseData().tags.length === 0
                          "
                          class="w-full bg-white/5 border border-white/10 rounded-2xl p-3 min-h-15 flex flex-wrap gap-2 focus-within:border-indigo-500/50 transition-all"
                        >
                          @for (tag of courseData().tags; track tag) {
                            <span
                              class="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-500/20"
                            >
                              {{ tag }}
                              <button
                                (click)="removeTag(tag)"
                                class="hover:text-white transition-colors"
                              >
                                <svg
                                  class="size-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  stroke-width="3"
                                >
                                  <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          }
                          <input
                            type="text"
                            [(ngModel)]="tagInput"
                            (keydown.enter)="addTag($event)"
                            (keydown.comma)="addTag($event)"
                            placeholder="Add tags (Enter or Comma)..."
                            class="flex-1 min-w-30 bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-slate-800"
                          />
                        </div>
                        @if (showValidationErrors && courseData().tags.length === 0) {
                          <span
                            class="text-[11px] text-rose-500 font-black uppercase tracking-widest ml-1 italic"
                            >At least one tag is required</span
                          >
                        }
                      </div>

                      <div
                        class="col-span-1 md:col-span-2 p-5 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between mt-4"
                      >
                        <div>
                          <h4
                            class="text-xs font-black uppercase tracking-widest text-indigo-100 italic"
                          >
                            Go Public
                          </h4>
                          <p class="text-[11px] text-slate-500 font-medium">
                            Enabling this makes your course discoverable by independent learners
                            outside your organization.
                          </p>
                        </div>
                        <button
                          (click)="courseData().isPublic = !courseData().isPublic"
                          [class.bg-indigo-600]="courseData().isPublic"
                          class="w-14 h-7 rounded-full border border-white/10 transition-all relative p-1 cursor-pointer"
                        >
                          <div
                            class="size-5 bg-white rounded-full transition-all shadow-lg"
                            [class.translate-x-7]="courseData().isPublic"
                          ></div>
                        </button>
                      </div>

                      <div class="col-span-1 md:col-span-2 space-y-4 pt-6">
                        <label
                          class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                          >Course description</label
                        >
                        <div
                          [class.border-rose-500/40]="
                            showValidationErrors &&
                            (!courseData().description || courseData().description.length < 20)
                          "
                          class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-100"
                        >
                          <quill-editor
                            [(ngModel)]="courseData().description"
                            [modules]="quillConfig"
                            theme="snow"
                            class="lumina-editor"
                          ></quill-editor>
                        </div>
                        @if (
                          showValidationErrors &&
                          (!courseData().description || courseData().description.length < 20)
                        ) {
                          <span
                            class="text-[11px] text-rose-500 font-black uppercase tracking-widest ml-1 italic"
                            >Description must be at least 20 characters</span
                          >
                        }
                      </div>
                    </div>
                    <div
                      class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] via-[#030712]/95 to-transparent pt-10 pb-6 lg:pb-0 px-4 lg:px-0 z-30 border-t border-white/5 lg:border-none"
                    >
                      <div class="max-w-4xl mx-auto flex items-center justify-end">
                        <button
                          (click)="saveCourse()"
                          class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <svg
                            class="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                }

                @if (identityTab() === 'STRUCTURE') {
                  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
                    <header>
                      <h2
                        class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2"
                      >
                        Curriculum Structure
                      </h2>
                      <p class="text-slate-500 text-sm font-medium mt-2">
                        Organize modules using drag and drop.
                      </p>
                    </header>

                    <div
                      cdkDropList
                      [cdkDropListData]="modules()"
                      (cdkDropListDropped)="onModuleDrop($event)"
                      class="space-y-4"
                    >
                      @for (module of modules(); track module.id; let modIdx = $index) {
                        <div
                          cdkDrag
                          class="group/mod bg-white/2 border border-white/5 rounded-4xl overflow-hidden transition-all hover:border-white/10"
                        >
                          <div class="flex items-center gap-4 p-5 bg-white/2">
                            <div
                              cdkDragHandle
                              class="cursor-grab active:cursor-grabbing p-2 text-slate-700 hover:text-indigo-500 transition-colors"
                            >
                              <svg
                                class="size-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                              >
                                <path d="M8 9h8" />
                                <path d="M8 12h8" />
                                <path d="M8 15h8" />
                              </svg>
                            </div>

                            <div class="flex-1 flex items-center gap-3">
                              <span class="text-slate-700 font-black italic text-sm"
                                >0{{ modIdx + 1 }}</span
                              >
                              <input
                                [(ngModel)]="module.title"
                                readonly
                                class="bg-transparent border-none outline-none text-sm font-black text-white w-full focus:text-indigo-400 transition-colors"
                              />
                            </div>

                            <button
                              (click)="toggleModuleStructure(module.id, $event)"
                              class="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                            >
                              <svg
                                class="size-4 text-slate-600 transition-transform duration-300"
                                [class.rotate-180]="expandedModuleIds().has(module.id)"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="3"
                              >
                                <path d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          @if (expandedModuleIds().has(module.id)) {
                            <div
                              cdkDropList
                              [cdkDropListData]="module.learningSteps"
                              (cdkDropListDropped)="onStepDrop($event)"
                              class="px-6 pb-6 space-y-2 bg-black/20 pt-4"
                            >
                              @for (
                                step of module.learningSteps || [];
                                track step.id;
                                let stepIdx = $index
                              ) {
                                <div
                                  class="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/2 border border-white/5 rounded-xl group hover:border-white/10 transition-all"
                                >
                                  <div
                                    class="cursor-grab active:cursor-grabbing text-slate-800 group-hover/step:text-indigo-500/50 transition-colors"
                                  ></div>

                                  <span class="text-slate-700 font-black italic text-sm"
                                    >0{{ stepIdx + 1 }}</span
                                  >

                                  <div class="flex-1 flex items-center gap-3">
                                    <div
                                      class="size-1.5 rounded-full shrink-0"
                                      [class.bg-amber-500]="step.type === 'QUIZ'"
                                      [class.bg-indigo-500]="step.type === 'LESSON'"
                                    ></div>
                                    <input
                                      [(ngModel)]="step.title"
                                      readonly
                                      class="bg-transparent border-none outline-none text-xs font-bold text-slate-300 w-full focus:text-white"
                                    />
                                  </div>

                                  <button
                                    (click)="selectStep(step)"
                                    class="px-3 py-1.5 text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/10 rounded-lg opacity-0 group-hover/step:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    Details
                                  </button>
                                </div>
                              } @empty {
                                <div
                                  class="py-10 border border-dashed border-white/5 rounded-2xl text-center"
                                >
                                  <p
                                    class="text-[10px] text-slate-600 font-black uppercase tracking-widest"
                                  >
                                    No learning steps in this module
                                  </p>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <div
                      class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] via-[#030712]/95 to-transparent pt-10 pb-6 lg:pb-0 px-4 lg:px-0 z-30 border-t border-white/5 lg:border-none"
                    >
                      <div
                        class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-end gap-6"
                      >
                        <button
                          (click)="discardModuleReorder()"
                          class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all cursor-pointer"
                        >
                          <svg
                            class="size-4 text-slate-700 group-hover:text-red-500 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Discard Changes
                        </button>

                        <button
                          (click)="reorderModuleSequence()"
                          class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <svg
                            class="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @if (activeView() === 'MODULE_STRUCTURE') {
              <div class="space-y-10 animate-in fade-in duration-500">
                <div class="flex justify-center mb-12">
                  <div
                    class="inline-flex p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md"
                  >
                    <button
                      type="button"
                      (click)="moduleTab.set('DETAILS')"
                      [class]="
                        moduleTab() === 'DETAILS'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-200'
                      "
                      class="flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        class="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Module Details
                    </button>

                    <button
                      type="button"
                      (click)="moduleTab.set('STRUCTURE')"
                      [class]="
                        moduleTab() === 'STRUCTURE'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'text-slate-500 hover:text-slate-200'
                      "
                      class="flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        class="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Curriculum Structure
                    </button>
                  </div>
                </div>

                @if (moduleTab() === 'DETAILS') {
                  <div class="space-y-6 animate-in slide-in-from-left-2 duration-300">
                    <header>
                      <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest"
                        >Module Title</span
                      >
                      <input
                        type="text"
                        [(ngModel)]="editingModuleTitle"
                        (focus)="$any($event.target).select()"
                        class="bg-transparent border-none outline-none text-xl font-black text-white italic tracking-tighter w-full mt-2"
                      />
                    </header>

                    <div
                      class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] via-[#030712]/95 to-transparent pt-10 pb-6 lg:pb-0 px-4 lg:px-0 z-30 border-t border-white/5 lg:border-none"
                    >
                      <div
                        class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-end gap-6"
                      >
                        <button
                          (click)="saveModule()"
                          class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <svg
                            class="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                }

                @if (moduleTab() === 'STRUCTURE') {
                  <div class="space-y-4 animate-in slide-in-from-right-2 duration-300">
                    <header>
                      <h2
                        class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2"
                      >
                        Curriculum Structure
                      </h2>
                      <p class="text-slate-500 text-sm font-medium mt-2">
                        Organize learning steps using drag and drop.
                      </p>
                    </header>

                    @if (selectedModuleId()) {
                      <div
                        class="flex flex-col sm:flex-row items-center gap-4 mt-8 mb-10 border-b border-white/5 pb-10"
                      >
                        @if (getSelectedModule()?.status === 'PUBLISHED' && selectedModuleId()) {
                          <div
                            class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl"
                          >
                            <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span
                              class="text-emerald-400 text-[11px] font-black uppercase tracking-widest"
                            >
                              Published
                            </span>
                          </div>
                        } @else if (getSelectedModule()?.isReadyToPublish) {
                          <button
                            (click)="publishModule()"
                            [disabled]="isPublishingModule() || isSaving()"
                            class="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                          >
                            @if (isPublishingModule()) {
                              <span
                                class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                              ></span>
                              Publishing...
                            } @else {
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
                                  d="M5 10l7-7m0 0l7 7m-7-7v14"
                                />
                              </svg>
                              Publish Module
                            }
                          </button>
                        }

                        <button
                          type="button"
                          (click)="confirmDeleteModule()"
                          [disabled]="isDeletingModule()"
                          class="group w-full sm:w-auto px-6 py-3 text-slate-500 hover:text-rose-500 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-transparent hover:bg-rose-500/5"
                        >
                          <svg
                            class="size-4 block opacity-40 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <path
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <span class="text-[11px] font-bold uppercase tracking-[0.2em]">
                            {{ isDeletingModule() ? 'Removing...' : 'Delete Module' }}
                          </span>
                        </button>
                      </div>
                    }
                    @if (isCreatingNew) {
                      <div class="w-full py-1.5">
                        <div
                          class="relative p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-md overflow-hidden"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
                            <span
                              class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500"
                            >
                              Module Configuration Required
                            </span>
                          </div>
                          <p
                            class="text-[10px] font-bold tracking-widest text-slate-400/80 leading-relaxed py-2"
                          >
                            Provide a module title & save to enable the curriculum builder
                          </p>
                        </div>
                      </div>
                    } @else {
                      <div
                        cdkDropList
                        [cdkDropListData]="getSelectedModule()?.learningSteps || []"
                        (cdkDropListDropped)="onStepDrop($event)"
                        class="space-y-3"
                      >
                        @for (
                          step of getSelectedModule()?.learningSteps;
                          track step.id;
                          let i = $index
                        ) {
                          <div
                            cdkDrag
                            class="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/2 border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                          >
                            <div
                              cdkDragHandle
                              class="cursor-grab active:cursor-grabbing p-1 text-slate-700 hover:text-indigo-500 transition-colors shrink-0"
                            >
                              <svg
                                class="size-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                              >
                                <path d="M8 9h8M8 12h8M8 15h8" />
                              </svg>
                            </div>

                            <div class="flex items-center gap-4 flex-1">
                              <span class="text-slate-700 font-black italic text-sm"
                                >0{{ i + 1 }}</span
                              >
                              <div class="flex-1 flex items-center gap-3">
                                <div
                                  class="size-1.5 rounded-full shrink-0"
                                  [class.bg-amber-500]="step.type === 'QUIZ'"
                                  [class.bg-indigo-500]="step.type === 'LESSON'"
                                ></div>
                                <input
                                  [(ngModel)]="step.title"
                                  readonly
                                  class="bg-transparent border-none outline-none text-sm font-bold text-white w-full focus:text-indigo-400 transition-colors"
                                />
                              </div>
                            </div>

                            <button
                              (click)="selectStep(step)"
                              class="w-full sm:w-auto px-4 py-2.5 text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-indigo-500 hover:text-white"
                            >
                              Edit Content
                            </button>
                          </div>
                        } @empty {
                          <div
                            class="py-12 border-2 border-dashed border-white/5 rounded-3xl text-center"
                          >
                            <p
                              class="text-[10px] text-slate-600 font-black uppercase tracking-widest"
                            >
                              No steps found in this module
                            </p>
                          </div>
                        }
                      </div>

                      <div class="grid grid-cols-2 gap-4 mt-8">
                        <button
                          (click)="addStep(selectedModuleId()!, 'LESSON')"
                          [disabled]="!selectedModuleId() || selectedModuleId() === 'NEW'"
                          class="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer"
                        >
                          <span
                            class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400"
                          >
                            + Add Lesson
                          </span>
                        </button>

                        <button
                          (click)="addStep(selectedModuleId()!, 'QUIZ')"
                          [disabled]="!selectedModuleId() || selectedModuleId() === 'NEW'"
                          class="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer"
                        >
                          <span
                            class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400"
                          >
                            + Add Quiz
                          </span>
                        </button>
                      </div>
                      <div
                        class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] via-[#030712]/95 to-transparent pt-10 pb-6 lg:pb-0 px-4 lg:px-0 z-30 border-t border-white/5 lg:border-none"
                      >
                        <div
                          class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-end gap-6"
                        >
                          <button
                            (click)="discardStepReorder()"
                            class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all cursor-pointer"
                          >
                            <svg
                              class="size-4 text-slate-700 group-hover:text-red-500 transition-colors"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="2.5"
                            >
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Discard Changes
                          </button>

                          <button
                            (click)="reOrderStepSequence()"
                            class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                          >
                            <svg
                              class="size-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (activeView() === 'LESSON_EDITOR') {
              <div class="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
                <header
                  class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10"
                >
                  <div class="flex-1 space-y-2">
                    <p
                      class="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] transition-colors"
                    >
                      Lesson Outline
                    </p>
                    <input
                      type="text"
                      [(ngModel)]="editingStepTitle"
                      (focus)="$any($event.target).select()"
                      class="bg-transparent border-none outline-none text-xl font-black text-white italic tracking-tighter w-full placeholder:text-slate-900 focus:placeholder:text-transparent transition-all"
                      [class.text-rose-400]="showValidationErrors && !editingStepTitle()"
                    />
                    @if (showValidationErrors && !editingStepTitle()) {
                      <span
                        class="text-[10px] font-black uppercase text-rose-500 animate-in fade-in italic"
                      >
                        Title is Required
                      </span>
                    }
                  </div>

                  <button
                    (click)="setView('MODULE_STRUCTURE', selectedModuleId())"
                    class="px-6 py-3 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Back to Module
                  </button>
                </header>

                <section
                  class="p-8 bg-white/3 border border-white/5 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-white/4"
                >
                  <div class="space-y-1">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                      Video Content
                    </h3>
                    <p class="text-[9px] text-slate-500 uppercase font-bold italic tracking-wider">
                      Enable high-performance video streaming for this lesson
                    </p>
                  </div>

                  <button
                    (click)="isVideoLesson.set(!isVideoLesson())"
                    [class]="isVideoLesson() ? 'bg-indigo-600' : 'bg-slate-800'"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out border-2 border-transparent"
                  >
                    <span
                      [class]="isVideoLesson() ? 'translate-x-5' : 'translate-x-0'"
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-300 ease-in-out"
                    ></span>
                  </button>
                </section>

                @if (isVideoLesson()) {
                  <section class="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div class="px-2">
                      <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                        Video Asset
                      </h3>
                    </div>

                    <div
                      class="group relative p-12 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-center"
                    >
                      @if (isSyncingToCloud()) {
                        <div
                          class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                        >
                          <div class="flex flex-col items-center space-y-4 w-full max-w-md">
                            <div
                              class="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2"
                            >
                              <span class="relative flex h-2 w-2">
                                <span
                                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                                ></span>
                                <span
                                  class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"
                                ></span>
                              </span>
                              <span
                                class="text-[9px] font-black text-indigo-500 uppercase tracking-widest"
                              >
                                Syncing to Cloud
                              </span>
                            </div>

                            <div class="relative size-12 flex items-center justify-center">
                              <div
                                class="absolute inset-0 border-2 border-indigo-500/10 rounded-2xl"
                              ></div>
                              <div
                                class="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-2xl animate-spin"
                              ></div>

                              <svg
                                class="size-5 text-indigo-400 animate-pulse"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2.5"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                />
                              </svg>
                            </div>

                            <div class="w-full space-y-1 text-center">
                              <p class="text-sm font-black text-white italic tracking-tight px-4">
                                Uploading Asset...
                              </p>
                              <p
                                class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse"
                              >
                                Do not refresh this page
                              </p>
                            </div>
                          </div>
                        </div>
                      } @else if (isUploadComplete()) {
                        <div
                          class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                        >
                          <div
                            class="w-full aspect-video rounded-3xl overflow-hidden border border-white/5 bg-slate-950 shadow-2xl shadow-black/50"
                          >
                            @if (currentPlaybackId()) {
                              <mux-player
                                [attr.playback-id]="currentPlaybackId()"
                                [attr.metadata-viewer-user-id]="currentUserId()"
                                primary-color="#6366f1"
                                secondary-color="transparent"
                                class="w-full h-full block"
                              ></mux-player>
                            } @else {
                              <div
                                class="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in"
                              >
                                <div class="relative size-10 flex items-center justify-center">
                                  <div
                                    class="absolute inset-0 border-2 border-white/5 rounded-2xl"
                                  ></div>
                                  <div
                                    class="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-2xl animate-spin"
                                  ></div>
                                  <svg
                                    class="size-4 text-indigo-500/50 animate-pulse"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      stroke-width="2.5"
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                  </svg>
                                </div>
                                <p
                                  class="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]"
                                >
                                  Preparing Stream...
                                </p>
                              </div>
                            }
                          </div>

                          <div class="flex flex-col items-center space-y-4 w-full max-w-md">
                            <div
                              class="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2"
                            >
                              <span class="relative flex h-2 w-2">
                                <span
                                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                                ></span>
                                <span
                                  class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                                ></span>
                              </span>
                              <span
                                class="text-[9px] font-black text-emerald-500 uppercase tracking-widest"
                              >
                                Verified at MUX
                              </span>
                            </div>

                            <div class="flex flex-col items-center space-y-4 w-full">
                              <div class="text-center px-4">
                                <p
                                  class="text-sm font-black text-white italic tracking-tight truncate max-w-xs"
                                >
                                  {{ selectedVideoFile()?.name }}
                                </p>
                                <p
                                  class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1"
                                >
                                  Cloud Hosted Asset
                                </p>
                              </div>

                              <button
                                (click)="removeVideo()"
                                [disabled]="isDeleting()"
                                title="Delete from MUX Permanently"
                                class="group p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                @if (isDeleting()) {
                                  <div
                                    class="size-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"
                                  ></div>
                                } @else {
                                  <div class="flex items-center gap-3 px-2">
                                    <svg
                                      class="size-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      stroke-width="2.5"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                      />
                                    </svg>
                                    <span class="text-[10px] font-black uppercase tracking-widest"
                                      >Delete from Cloud</span
                                    >
                                  </div>
                                }
                              </button>
                            </div>
                          </div>
                        </div>
                      } @else if (!selectedVideoFile()) {
                        <div
                          class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center py-2"
                        >
                          <div
                            class="flex flex-col items-center space-y-4 w-full max-w-sm relative group"
                          >
                            <input
                              type="file"
                              class="absolute inset-0 opacity-0 z-30 cursor-pointer disabled:cursor-not-allowed"
                              (change)="onMainVideoSelected($event)"
                              accept="video/*"
                              [disabled]="isSystemLocked()"
                            />

                            <div
                              class="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2"
                            >
                              <span class="relative flex h-1.5 w-1.5">
                                <span
                                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                                ></span>
                                <span
                                  class="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"
                                ></span>
                              </span>
                              <span
                                class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em]"
                              >
                                Video Upload Ready
                              </span>
                            </div>

                            <div
                              class="size-10 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300"
                            >
                              <svg
                                class="size-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2.5"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </div>

                            <div class="space-y-1.5 text-center">
                              <p class="text-sm font-black text-white italic tracking-tight px-4">
                                Select Master Video File
                              </p>
                              <p
                                class="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]"
                              >
                                Cloud Sync Active
                              </p>
                            </div>
                          </div>
                        </div>
                      } @else {
                        <div
                          class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                        >
                          <div class="flex flex-col items-center space-y-4 w-full max-w-md">
                            <div
                              class="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2"
                            >
                              <span class="relative flex h-1.5 w-1.5">
                                <span
                                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                                ></span>
                                <span
                                  class="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"
                                ></span>
                              </span>
                              <span
                                class="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]"
                              >
                                Confirm Video Source
                              </span>
                            </div>

                            <div class="w-full space-y-1 text-center">
                              <p
                                class="text-sm font-black text-white italic tracking-tight px-4 truncate"
                              >
                                {{ selectedVideoFile()?.name }}
                              </p>
                              <p
                                class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]"
                              >
                                Staged for secure upload
                              </p>
                            </div>

                            <div class="flex items-center gap-3">
                              <button
                                (click)="removeVideo()"
                                [disabled]="isDeleting()"
                                title="Discard Video"
                                class="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                @if (isDeleting()) {
                                  <div
                                    class="size-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"
                                  ></div>
                                } @else {
                                  <svg
                                    class="size-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                }
                              </button>

                              <button
                                (click)="startVideoUpload()"
                                title="Start Syncing"
                                class="p-3 bg-indigo-600 border border-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-110 transition-all active:scale-90 cursor-pointer"
                              >
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
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </section>
                }
                <section
                  class="p-8 bg-white/3 border border-white/5 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-white/4"
                >
                  <div class="space-y-1">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                      Lesson Content
                    </h3>
                    <p class="text-[9px] text-slate-500 uppercase font-bold italic tracking-wider">
                      Enable rich text editor for lesson body
                    </p>
                  </div>

                  <button
                    (click)="isContentEnabled.set(!isContentEnabled())"
                    [class]="isContentEnabled() ? 'bg-indigo-600' : 'bg-slate-800'"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out border-2 border-transparent"
                  >
                    <span
                      [class]="isContentEnabled() ? 'translate-x-5' : 'translate-x-0'"
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-300 ease-in-out"
                    ></span>
                  </button>
                </section>

                @if (isContentEnabled()) {
                  <section class="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div class="px-2 flex justify-between items-center">
                      <h3
                        class="text-[10px] font-black uppercase tracking-[0.4em] transition-colors text-white"
                      >
                        Body Content
                      </h3>
                    </div>

                    <div
                      class="bg-white/5 rounded-[2.5rem] overflow-hidden min-h-125 shadow-2xl transition-all duration-50"
                    >
                      <quill-editor
                        [(ngModel)]="editingStepContent"
                        (onSelectionChanged)="contentTouched = true"
                        [modules]="quillConfig"
                        theme="snow"
                        class="lumina-editor"
                      ></quill-editor>
                    </div>
                    @if (showValidationErrors && !editingStepContent()) {
                      <p class="text-[10px] font-black uppercase text-rose-500 animate-in fade-in">
                        Lesson Content is Required
                      </p>
                    }
                  </section>
                }

                <section
                  class="p-8 bg-white/3 border border-white/5 rounded-[2.5rem] flex items-center justify-between transition-all hover:bg-white/4"
                >
                  <div class="space-y-1">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                      Resource Content
                    </h3>
                    <p class="text-[9px] text-slate-500 uppercase font-bold italic tracking-wider">
                      Enable file attachments and downloadable assets
                    </p>
                  </div>

                  <button
                    (click)="isMaterialsEnabled.set(!isMaterialsEnabled())"
                    [class]="isMaterialsEnabled() ? 'bg-indigo-600' : 'bg-slate-800'"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out border-2 border-transparent"
                  >
                    <span
                      [class]="isMaterialsEnabled() ? 'translate-x-5' : 'translate-x-0'"
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-300 ease-in-out"
                    ></span>
                  </button>
                </section>

                @if (isMaterialsEnabled()) {
                  <section class="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div
                      class="flex items-center justify-between border-b border-white/5 pb-5 px-2"
                    >
                      <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                        Attached Assets
                      </h3>
                      <button
                        (click)="addAttachment()"
                        class="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        [class.text-indigo-400]="!isSystemLocked()"
                        [class.text-slate-500]="isSystemLocked()"
                        [disabled]="isSystemLocked()"
                      >
                        {{ isSystemLocked() ? 'Complete pending action' : '+ Add Material' }}
                      </button>
                    </div>

                    <div class="space-y-4">
                      @for (file of editingResources(); track $index) {
                        <div
                          class="group relative p-8 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-center"
                          [class.border-rose-500/30]="
                            showValidationErrors && (!file.name || !file.objectKey)
                          "
                        >
                          @if (loadingStates.get(file)) {
                            <div class="space-y-4 animate-in fade-in duration-500">
                              <div class="flex flex-col items-center justify-center space-y-4">
                                <div class="relative size-12">
                                  <div
                                    class="absolute inset-0 border-4 border-indigo-500/10 rounded-xl"
                                  ></div>
                                  <div
                                    class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-xl animate-spin"
                                  ></div>
                                  <div class="absolute inset-0 flex items-center justify-center">
                                    <svg
                                      class="size-6 text-indigo-500 animate-pulse"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                <div class="space-y-1">
                                  <p class="text-sm font-black text-white italic tracking-tight">
                                    Syncing to Cloud...
                                  </p>
                                  <p
                                    class="text-[9px] font-bold text-slate-500 uppercase tracking-widest"
                                  >
                                    Do not refresh this page
                                  </p>
                                </div>
                              </div>
                            </div>
                          } @else if (file.objectKey || file.s3PreSignedUrl) {
                            <div
                              class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                            >
                              <div class="flex flex-col items-center space-y-4 w-full max-w-md">
                                <div
                                  class="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2"
                                >
                                  <span class="relative flex h-2 w-2">
                                    <span
                                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                                    ></span>
                                    <span
                                      class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                                    ></span>
                                  </span>
                                  <span
                                    class="text-[9px] font-black text-emerald-500 uppercase tracking-widest"
                                    >Verified & Secure</span
                                  >
                                </div>

                                <input
                                  [(ngModel)]="file.name"
                                  class="text-sm font-black text-white italic tracking-tight bg-transparent text-center border-none outline-none w-full px-4"
                                />

                                <div class="flex items-center gap-3">
                                  @if (file.s3PreSignedUrl) {
                                    <a
                                      [href]="file.s3PreSignedUrl"
                                      target="_blank"
                                      title="Open Asset"
                                      class="p-3 bg-white/5 border border-white/10 rounded-2xl text-indigo-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all active:scale-90"
                                    >
                                      <svg
                                        class="size-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                      >
                                        <path
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                      </svg>
                                    </a>
                                  }

                                  <button
                                    (click)="removeAttachment($index)"
                                    [disabled]="deletingStates.has(file)"
                                    title="Delete Permanently"
                                    class="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    @if (deletingStates.has(file)) {
                                      <div
                                        class="size-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"
                                      ></div>
                                    } @else {
                                      <svg
                                        class="size-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                      >
                                        <path
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                      </svg>
                                    }
                                  </button>
                                </div>
                              </div>
                            </div>
                          } @else if (!$any(file).tempFile) {
                            <div
                              class="space-y-2 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                            >
                              <div
                                class="flex flex-col items-center space-y-2 w-full max-w-md relative group"
                              >
                                <input
                                  type="file"
                                  class="absolute inset-0 opacity-0 z-30 cursor-pointer disabled:cursor-not-allowed"
                                  (change)="onFileSelected($event, file)"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                  [disabled]="isSystemLocked()"
                                />

                                <div
                                  class="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2"
                                >
                                  <span class="relative flex h-1.5 w-1.5">
                                    <span
                                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                                    ></span>
                                    <span
                                      class="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"
                                    ></span>
                                  </span>
                                  <span
                                    class="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em]"
                                  >
                                    Ready for Upload
                                  </span>
                                </div>

                                <div
                                  class="size-10 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300"
                                >
                                  <svg
                                    class="size-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                  </svg>
                                </div>

                                <div class="w-full space-y-1.5 text-center">
                                  <input
                                    [(ngModel)]="file.name"
                                    (click)="$event.stopPropagation()"
                                    class="text-sm font-black text-white italic tracking-tight bg-transparent text-center border-none outline-none w-full px-4 focus:text-indigo-400 transition-colors"
                                  />
                                  <p
                                    class="text-sm font-black text-white italic tracking-tight px-4"
                                  >
                                    Select Material File
                                  </p>
                                  <p
                                    class="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]"
                                  >
                                    Cloud Sync Active
                                  </p>
                                </div>

                                <div class="flex items-center gap-3 relative z-40">
                                  <button
                                    (click)="removeAttachment($index)"
                                    [disabled]="isSystemLocked()"
                                    title="Remove Slot"
                                    class="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <svg
                                      class="size-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      stroke-width="2.5"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          } @else {
                            <div
                              class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                            >
                              <div class="flex flex-col items-center space-y-4 w-full max-w-md">
                                <div
                                  class="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2"
                                >
                                  <span class="relative flex h-2 w-2">
                                    <span
                                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                                    ></span>
                                    <span
                                      class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"
                                    ></span>
                                  </span>
                                  <span
                                    class="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none"
                                  >
                                    Confirm Selection
                                  </span>
                                </div>

                                <div class="w-full space-y-1 text-center">
                                  <p
                                    class="text-sm font-black text-white italic tracking-tight px-4 truncate"
                                  >
                                    {{ $any(file).tempFile.name }}
                                  </p>
                                  <p
                                    class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none"
                                  >
                                    Ready for secure sync
                                  </p>
                                </div>

                                <div class="flex items-center gap-3">
                                  <button
                                    (click)="$any(file).tempFile = null; file.name = ''"
                                    title="Discard Selection"
                                    class="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 cursor-pointer"
                                  >
                                    <svg
                                      class="size-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      stroke-width="2.5"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    (click)="confirmUpload(file)"
                                    title="Sync to Cloud"
                                    class="p-3 bg-indigo-600 border border-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-110 transition-all active:scale-90 cursor-pointer"
                                  >
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
                                        d="M4.5 12.75l6 6 9-13.5"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      } @empty {
                        <div
                          (click)="addAttachment()"
                          class="flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/5 rounded-4xl hover:border-indigo-500/20 hover:bg-white/1 transition-all cursor-pointer group"
                        >
                          <div
                            class="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-700 group-hover:text-indigo-500 transition-colors mb-4"
                          >
                            <svg
                              class="size-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path stroke-width="1.5" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p
                            class="text-[12px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors"
                          >
                            No materials attached to this lesson
                          </p>
                        </div>
                      }
                    </div>
                  </section>
                }
                <div
                  class="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-4 pt-12 pb-20 border-t border-white/5"
                >
                  @if (getSelectedStep() != null) {
                    <button
                      type="button"
                      (click)="getSelectedStep() && confirmDelete(getSelectedStep()!)"
                      [disabled]="isDeleting()"
                      class="group w-full sm:w-auto px-4 py-3 sm:py-2 text-slate-500 hover:text-rose-500 rounded-xl transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 cursor-pointer bg-transparent hover:bg-rose-500/5 order-3 sm:order-1"
                    >
                      <svg
                        class="size-3.5 block opacity-40 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>

                      <span class="text-[11px] font-bold uppercase tracking-[0.2em] leading-none">
                        {{ isDeleting() ? 'Removing...' : 'Delete Lesson' }}
                      </span>
                    </button>
                  }

                  <button
                    (click)="saveStep()"
                    [disabled]="isSaving() || hasPendingUploads()"
                    class="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer order-1 sm:order-2"
                  >
                    @if (isSaving()) {
                      <span
                        class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      ></span>
                      Saving...
                    } @else {
                      <svg
                        class="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      Save Changes
                    }
                  </button>

                  <div class="flex items-center gap-3 w-full sm:w-auto order-2 sm:order-3">
                    @if (getSelectedStep()?.status === 'PUBLISHED') {
                      <div
                        class="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl"
                      >
                        <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span
                          class="text-emerald-400 text-[11px] font-black uppercase tracking-widest"
                        >
                          Published
                        </span>
                      </div>
                    } @else {
                      <button
                        (click)="publishStep()"
                        [disabled]="
                          isPublishing() || !getSelectedStep()?.readyToPublish || isSaving()
                        "
                        class="group flex items-center justify-center gap-2 w-full px-7 py-3.5 border-2 border-emerald-500 text-emerald-400 hover:text-white hover:bg-emerald-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        @if (isPublishing()) {
                          <span
                            class="size-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
                          ></span>
                          Publishing...
                        } @else {
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5 10l7-7m0 0l7 7"
                            />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v14" />
                          </svg>
                          Publish Lesson
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
            @if (activeView() === 'QUIZ_EDITOR') {
              <div class="space-y-10 animate-in fade-in duration-500 pb-24">
                <header
                  class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-8 gap-4"
                >
                  <div class="flex-1">
                    <p
                      class="text-indigo-500/60 text-[10px] font-black uppercase tracking-widest mt-2"
                    >
                      Quiz Designer • {{ quizQuestions().length }} Questions
                    </p>
                    <input
                      [(ngModel)]="editingStepTitle"
                      class="bg-transparent border-none outline-none text-xl lg:text-2xl font-black text-white italic tracking-tighter w-full mt-2 placeholder:text-white/20"
                    />
                    @if (showValidationErrors && !editingStepTitle()) {
                      <span
                        class="text-[10px] font-black uppercase text-rose-500 animate-in fade-in italic"
                      >
                        Title is Required
                      </span>
                    }
                  </div>
                  <button
                    (click)="setView('MODULE_STRUCTURE', selectedModuleId())"
                    class="w-full sm:w-auto px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all hover:bg-white/5 cursor-pointer"
                  >
                    Back to Module
                  </button>
                </header>

                <div class="space-y-8">
                  @if (quizQuestions().length === 0) {
                    <div
                      class="py-20 text-center border-2 border-dashed border-white/5 rounded-4xl bg-white/1"
                    >
                      <svg
                        class="size-12 mx-auto text-slate-800 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <p class="text-slate-600 font-black uppercase text-[10px] tracking-[0.2em]">
                        No questions added to this quiz yet.
                      </p>
                    </div>
                  }

                  @for (question of quizQuestions(); track $index; let qIdx = $index) {
                    <div
                      class="p-8 bg-white/2 border border-white/5 rounded-4xl space-y-6 relative group hover:border-white/10 transition-all"
                    >
                      <button
                        (click)="removeQuestion(qIdx)"
                        class="absolute top-6 right-6 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      <div class="flex items-start gap-6">
                        <span
                          class="text-2xl font-black italic text-indigo-500/20 leading-none select-none"
                        >
                          {{ qIdx + 1 }}
                        </span>

                        <div class="flex-1 space-y-4">
                          <input
                            [(ngModel)]="question.questionText"
                            placeholder="What is the question?"
                            class="w-full bg-transparent border-none outline-none text-white font-bold text-lg placeholder:text-slate-800"
                          />

                          <div class="flex items-center gap-6">
                            <label
                              class="flex items-center gap-3 cursor-pointer select-none w-fit group/toggle"
                            >
                              <input
                                type="checkbox"
                                [(ngModel)]="question.hasMultipleAnswers"
                                (change)="handleOptionToggle(qIdx, -1)"
                                class="hidden"
                              />
                              <div
                                class="w-10 h-5 bg-slate-800 rounded-full relative transition-colors"
                                [class.bg-indigo-500]="question.hasMultipleAnswers"
                              >
                                <div
                                  class="absolute top-1 left-1 size-3 bg-white rounded-full transition-transform"
                                  [class.translate-x-5]="question.hasMultipleAnswers"
                                ></div>
                              </div>
                              <span
                                class="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/toggle:text-slate-300 transition-colors"
                              >
                                Allow Multiple Correct Answers
                              </span>
                            </label>

                            @if (question.hasMultipleAnswers && getCorrectCount(qIdx) < 2) {
                              <div class="flex items-center gap-2 text-amber-500 animate-pulse">
                                <svg
                                  class="size-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                                <span class="text-[8px] font-black uppercase tracking-widest">
                                  Select 2+ correct answers
                                </span>
                              </div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                        @for (opt of question.answerOptions; track $index; let oIdx = $index) {
                          <div
                            class="flex items-center gap-4 p-4 rounded-2xl border transition-all relative group/opt cursor-pointer"
                            [class.bg-emerald-500/5]="opt.isCorrect"
                            [class.border-emerald-500/30]="opt.isCorrect"
                            [class.border-white/5]="!opt.isCorrect"
                            (click)="handleOptionToggle(qIdx, oIdx)"
                          >
                            <div
                              class="flex items-center justify-center size-5 border-2 transition-all"
                              [class.rounded-full]="!question.hasMultipleAnswers"
                              [class.rounded-md]="question.hasMultipleAnswers"
                              [class.bg-emerald-500]="opt.isCorrect"
                              [class.border-emerald-500]="opt.isCorrect"
                              [class.border-white/20]="!opt.isCorrect"
                            >
                              @if (opt.isCorrect) {
                                <svg
                                  class="size-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              }
                            </div>

                            <div class="flex-1">
                              <div class="flex items-center gap-2 mb-1">
                                <p
                                  class="text-[8px] font-black uppercase tracking-tighter transition-colors"
                                  [class.text-emerald-500]="opt.isCorrect"
                                  [class.text-slate-700]="!opt.isCorrect"
                                >
                                  {{ opt.isCorrect ? 'Correct Answer' : 'Incorrect Option' }}
                                </p>
                              </div>

                              <input
                                [(ngModel)]="opt.answerText"
                                (click)="$event.stopPropagation()"
                                placeholder="Option text..."
                                class="bg-transparent border-none outline-none text-sm w-full pr-8 transition-colors"
                                [class.text-white]="opt.isCorrect"
                                [class.text-slate-400]="!opt.isCorrect"
                              />
                            </div>

                            @if (question.answerOptions.length > 2) {
                              <button
                                (click)="$event.stopPropagation(); removeOption(qIdx, oIdx)"
                                class="absolute right-3 opacity-0 group-hover/opt:opacity-100 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
                              >
                                <svg
                                  class="size-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            }
                          </div>
                        }

                        <button
                          (click)="addOption(qIdx)"
                          class="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-white/5 text-slate-600 hover:border-indigo-500/20 hover:text-indigo-400 transition-all text-[10px] font-black uppercase tracking-widest bg-white/1 cursor-pointer"
                        >
                          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Option
                        </button>
                      </div>
                    </div>
                  }

                  <button
                    (click)="addQuestion()"
                    class="w-full py-8 border-2 border-dashed border-white/5 rounded-4xl text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] hover:border-indigo-500/20 hover:text-indigo-400 transition-all bg-white/1 cursor-pointer flex items-center justify-center gap-3"
                  >
                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Question to Quiz
                  </button>
                </div>

                <div
                  class="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-4 pt-12 pb-20 border-t border-white/5"
                >
                  @if (getSelectedStep() != null) {
                    <button
                      type="button"
                      (click)="getSelectedStep() && confirmDelete(getSelectedStep()!)"
                      [disabled]="isDeleting()"
                      class="group w-full sm:w-auto px-4 py-3 sm:py-2 text-slate-500 hover:text-rose-500 rounded-xl transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 cursor-pointer bg-transparent hover:bg-rose-500/5 order-3 sm:order-1"
                    >
                      <svg
                        class="size-3.5 block opacity-40 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>

                      <span class="text-[11px] font-bold uppercase tracking-[0.2em] leading-none">
                        {{ isDeleting() ? 'Removing...' : 'Delete Lesson' }}
                      </span>
                    </button>
                  }

                  <button
                    (click)="saveStep()"
                    [disabled]="isSaving() || hasPendingUploads()"
                    class="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer order-1 sm:order-2"
                  >
                    @if (isSaving()) {
                      <span
                        class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      ></span>
                      Saving...
                    } @else {
                      <svg
                        class="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      Save Changes
                    }
                  </button>

                  <div class="flex items-center gap-3 w-full sm:w-auto order-2 sm:order-3">
                    @if (getSelectedStep()?.status === 'PUBLISHED') {
                      <div
                        class="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl"
                      >
                        <div class="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span
                          class="text-emerald-400 text-[11px] font-black uppercase tracking-widest"
                        >
                          Published
                        </span>
                      </div>
                    } @else {
                      <button
                        (click)="publishStep()"
                        [disabled]="
                          isPublishing() || !getSelectedStep()?.readyToPublish || isSaving()
                        "
                        class="group flex items-center justify-center gap-2 w-full px-7 py-3.5 border-2 border-emerald-500 text-emerald-400 hover:text-white hover:bg-emerald-500/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        @if (isPublishing()) {
                          <span
                            class="size-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
                          ></span>
                          Publishing...
                        } @else {
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5 10l7-7m0 0l7 7"
                            />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v14" />
                          </svg>
                          Publish Quiz
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </main>
      </div>

      @if (isSidebarOpen()) {
        <div
          (click)="isSidebarOpen.set(false)"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      }
    </div>

    @if (stepToDelete(); as step) {
      <div
        class="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        (click)="cancelDelete()"
      >
        <div
          class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
          (click)="$event.stopPropagation()"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
          >
            <i class="pi pi-exclamation-triangle text-2xl text-red-600"></i>
          </div>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Step?</h2>

          <p class="text-slate-600 dark:text-slate-400 mb-6">
            Are you sure you want to delete
            <span class="font-semibold text-slate-900 dark:text-white">"{{ step.title }}"</span>?
            This action is permanent and removes all videos and files.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              [disabled]="isDeleting()"
              (click)="cancelDelete()"
            >
              Keep it
            </button>

            <button
              type="button"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              [disabled]="isDeleting()"
              (click)="executePurge()"
            >
              @if (isDeleting()) {
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                Purging...
              } @else {
                Yes, Delete
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODULE DELETE CONFIRMATION MODAL -->
    @if (moduleToDelete(); as mod) {
      <div
        class="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        (click)="cancelModuleDelete()"
      >
        <div
          class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200"
          (click)="$event.stopPropagation()"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
          >
            <i class="pi pi-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Module?</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            Are you sure you want to permanently delete the module
            <span class="font-semibold text-slate-900 dark:text-white">"{{ mod.title }}"</span>
            and <span class="font-medium text-rose-500">all its learning steps</span>?
          </p>
          <p class="text-xs text-slate-500 mb-6 italic">
            This action cannot be undone and will remove all associated videos and files from cloud
            storage.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              [disabled]="isDeletingModule()"
              (click)="cancelModuleDelete()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              [disabled]="isDeletingModule()"
              (click)="executeDeleteModule()"
            >
              @if (isDeletingModule()) {
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                Deleting...
              } @else {
                Yes, Delete Module
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        flex: 1;
        min-height: 0;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }

      /* 1. Main Editor Container */
      ::ng-deep .lumina-editor {
        display: block;
        background: transparent;
      }

      /* 2. Toolbar Styling - Matches your headers */
      ::ng-deep .ql-toolbar.ql-snow {
        border: none !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        background: rgba(255, 255, 255, 0.02);
        padding: 16px 24px !important; /* Slightly more spacious */
      }

      /* 3. Icon Colors & Indigo Accents */
      ::ng-deep .ql-snow .ql-stroke {
        stroke: #64748b !important; /* slate-500 */
        transition: all 0.2s ease;
      }

      ::ng-deep .ql-snow .ql-fill {
        fill: #64748b !important; /* slate-500 */
        transition: all 0.2s ease;
      }

      ::ng-deep .ql-snow.ql-toolbar button:hover .ql-stroke,
      ::ng-deep .ql-snow.ql-toolbar button.ql-active .ql-stroke {
        stroke: #818cf8 !important; /* indigo-400 */
      }

      ::ng-deep .ql-snow.ql-toolbar button:hover .ql-fill,
      ::ng-deep .ql-snow.ql-toolbar button.ql-active .ql-fill {
        fill: #818cf8 !important; /* indigo-400 */
      }

      /* 4. Dropdowns/Pickers (e.g., Headers) */
      ::ng-deep .ql-snow .ql-picker {
        color: #64748b !important;
        font-size: 10px !important;
        font-weight: 900 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.1em !important;
      }

      ::ng-deep .ql-snow .ql-picker-options {
        background-color: #030712 !important; /* Your deep dark background */
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        padding: 8px !important;
      }

      /* 5. Content Area */
      ::ng-deep .ql-container.ql-snow {
        border: none !important;
        min-height: 400px;
        font-family: inherit;
      }

      ::ng-deep .ql-editor {
        color: #cbd5e1 !important; /* slate-300 - better readability than pure white */
        font-size: 15px; /* Slightly more compact */
        line-height: 1.8;
        padding: 32px !important;
      }

      ::ng-deep .ql-editor.ql-blank::before {
        color: #1e293b !important; /* slate-800 - dark placeholder */
        font-style: italic !important;
        left: 32px !important;
      }

      @media (min-width: 1024px) {
        ::ng-deep .ql-editor {
          font-size: 16px;
          padding: 48px !important;
        }
      }
    `,
  ],
})
export class CourseBuilder implements OnInit {
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private moduleService = inject(ModuleService);
  private learningStepService = inject(LearningStepService);
  muxService = inject(MuxService);
  s3Service = inject(S3Service);
  private readonly keycloak = inject(Keycloak);
  private notificationService = inject(NotificationService);

  activeView = signal<StudioView>('COURSE_IDENTITY');

  isSidebarOpen = signal(false);
  isDropdownOpen = signal(false);

  categories = signal<CourseCategoryResponse[]>([]);
  selectedCategoryName = signal<string | null>(null);
  tagInput = '';

  showValidationErrors = false;

  courseId = signal<string | null>(null);

  // The raw data from the server (The Backup)
  private rawCourseResponse = signal<CourseResponse | null>(null);

  courseData = signal({
    title: '',
    slug: '',
    tier: 'FREE' as 'FREE' | 'PREMIUM',
    isPublic: false,
    price: 0,
    description: '',
    categoryId: '',
    tags: [] as string[],
  });

  modules = signal<ModuleResponse[]>([]);

  quillConfig = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  };

  private route = inject(ActivatedRoute);
  router = inject(Router);

  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    // 1. Drop the curtain immediately
    this.isLoading.set(true);

    // 2. Start loading global data
    this.loadCategories();

    const idFromUrl = this.route.snapshot.paramMap.get('id');

    if (idFromUrl) {
      // 3a. Edit mode stays behind the curtain until the API responds
      this.enterEditMode(idFromUrl);
    } else {
      // 3b. Create mode is instant, so we can lift the curtain immediately
      this.enterCreateMode();
      this.isLoading.set(false);
    }

    // Set the current user ID for tracking purposes
    const sub = this.keycloak?.subject;
    this.currentUserId.set(sub || 'anonymous-viewer');
  }

  enterCreateMode() {
    this.courseId.set(null);

    this.courseData.set({
      title: '',
      slug: '',
      tier: 'FREE',
      isPublic: false,
      price: 0,
      description: '',
      categoryId: '',
      tags: [],
    });

    this.modules.set([]);
  }

  enterEditMode(id: string) {
    this.courseId.set(id);
    this.loadExistingCourse(id);
  }

  // Add this to your component
  identityTab = signal<'DETAILS' | 'STRUCTURE'>('DETAILS');

  private loadExistingCourse(id: string) {
    this.isLoading.set(true);

    this.courseService
      .getCourseById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: CourseResponse) => {
          this.syncSignals(response);
        },
        error: () => {
          this.notificationService.error('Could not find the requested course');
          this.router.navigate(['/manager/courses']);
        },
      });
  }

  private syncSignals(response: CourseResponse | null) {
    if (!response) {
      this.notificationService.error('Failed to load course data');
      return;
    }

    // SAVE THE FULL BACKUP HERE
    this.rawCourseResponse.set(response);

    this.courseData.set({
      title: response.title,
      slug: response.slug,
      description: response.description,
      tags: [...response.tags],
      isPublic: response.isPublic,
      tier: response.accessTier as 'FREE' | 'PREMIUM',
      price: response.price,
      categoryId: response.categoryId,
    });

    // 2. Sync the Modules & Lessons
    // This is the "Magic" that makes the modules appear after refresh
    if (response.modules) {
      const processedModules = response.modules
        .map((mod) => ({
          ...mod,
          // Ensure steps are sorted by sequence so UI order is consistent
          learningSteps: mod.learningSteps
            ? [...mod.learningSteps].sort((a, b) => a.sequence - b.sequence)
            : [],
        }))
        .sort((a, b) => a.sequence - b.sequence);
      this.modules.set(processedModules);
    } else {
      this.modules.set([]);
    }

    // Map categoryId → category name if categories are loaded
    const matchedCategory = this.categories().find((cat) => cat.id === response.categoryId);
    this.selectedCategoryName.set(matchedCategory?.name || null);

    this.courseId.set(response.id);
  }

  private loadCategories() {
    this.categoryService
      .getAllActiveCategories()
      .pipe(map((data) => data.map((cat) => ({ ...cat }))))
      .subscribe((formatted) => this.categories.set(formatted));
  }

  updateSlug() {
    const slug = this.courseData()
      .title.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.courseData.update((d) => ({ ...d, slug }));
  }

  setTier(tier: 'FREE' | 'PREMIUM') {
    this.courseData.update((d) => ({
      ...d,
      tier,
      price: tier === 'FREE' ? 0 : d.price,
    }));
  }

  addTag(event: Event) {
    event.preventDefault();

    const val = this.tagInput.trim().replace(/,/g, '');

    if (val && !this.courseData().tags.includes(val)) {
      this.courseData.update((d) => ({
        ...d,
        tags: [...d.tags, val],
      }));
    }

    this.tagInput = '';
  }

  removeTag(tag: string) {
    this.courseData.update((d) => ({
      ...d,
      tags: d.tags.filter((t) => t !== tag),
    }));
  }

  getSelectedModule() {
    const moduleId = this.selectedModuleId();
    if (!moduleId || moduleId === 'NEW') return null;

    const found = this.modules().find((m) => m.id === moduleId);

    if (!found) return null;

    // Return a fresh object with guaranteed array
    return {
      ...found,
      learningSteps: found.learningSteps ? [...found.learningSteps] : [],
    };
  }

  isReadyToPublish(): boolean {
    const course = this.rawCourseResponse(); // or this.courseData() if you add the field
    return course?.isReadyToPublish === true;
  }

  isCoursePublished(): boolean {
    const raw = this.rawCourseResponse();
    if (raw?.status === 'PUBLISHED') return true;
    return false;
  }

  saveCourse() {
    const data = this.courseData();

    // Validate course identity before creating/updating
    if (!this.isReadyToPublish() && this.activeView() === 'COURSE_IDENTITY') {
      this.showValidationErrors = true;
      this.notificationService.error('Please complete all required fields before continuing.');
      return;
    }

    if (this.isSaving()) return;

    this.showValidationErrors = false;
    this.isSaving.set(true);

    const request = {
      title: data.title,
      slug: data.slug,
      accessTier: data.tier,
      isPublic: data.isPublic,
      price: data.price,
      description: data.description,
      categoryId: data.categoryId,
      tags: data.tags,
    };

    const isExisting = !!this.courseId();

    const request$ = isExisting
      ? this.courseService.updateCourse(this.courseId()!, request)
      : this.courseService.createCourse(request);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (response: CourseResponse) => {
        this.syncSignals(response);

        if (!isExisting) {
          // Friendly toast after creation, then redirect
          this.notificationService.success(
            'Draft created successfully! Time to build your modules.',
          );
          setTimeout(() => {
            this.router.navigate(['/manager/courses/studio', response.id], { replaceUrl: true });
          }, 100); // short delay to allow toast to appear
        } else {
          this.notificationService.success('Your changes have been saved successfully.');
        }
      },
      error: (err) => {
        const message = err.error?.detail || 'Failed to save course.';
        this.notificationService.error(`${message}`);
      },
    });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  selectCategory(cat: CourseCategoryResponse) {
    this.courseData.update((d) => ({
      ...d,
      categoryId: cat.id,
    }));

    this.selectedCategoryName.set(cat.name);
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  setView(view: StudioView, id: string | null = null) {
    this.activeView.set(view);

    // Only overwrite the ID if we are actually switching to a different record.
    // If id is null, we "stay" on the current Module UUID.
    if (id !== null) {
      this.selectedId.set(id);
    }
  }

  editingModuleTitle = 'Untitled Module';
  isCreatingNew = false;
  selectedId = signal<string | null>(null);

  // Add this to your component
  selectModule(module: ModuleResponse) {
    this.isCreatingNew = false;

    this.selectedModuleId.set(module.id); // ✅ correct signal

    // THIS IS THE FIX: Push the existing title into the input's variable
    this.editingModuleTitle = module.title;

    this.setView('MODULE_STRUCTURE');
  }

  addModule() {
    if (!this.courseId()) {
      this.notificationService.info('Please save course info first');
      return;
    }

    this.isCreatingNew = true;
    this.editingModuleTitle = 'Untitled Module';
    this.selectedModuleId.set(null); // Use a placeholder ID for the view
    this.setView('MODULE_STRUCTURE');
  }

  saveModule() {
    // 1. Calculate the next sequence number based on current list length
    const nextSequence = this.modules().length + 1;

    const payload: ModuleRequest = {
      courseId: this.courseId()!,
      title: this.editingModuleTitle,
      sequence: nextSequence,
    };

    if (this.isCreatingNew) {
      this.moduleService.createModule(payload).subscribe({
        next: (savedModule) => {
          // 2. NOW we update the main list with the verified data
          this.modules.update((currentList) => [...currentList, savedModule]);

          // 3. Update state to reflect it's no longer a "New" draft
          this.selectedModuleId.set(savedModule.id);
          this.isCreatingNew = false;

          this.notificationService.success('Your changes have been saved successfully.');
        },
        error: (err) => {
          const message = err.error?.detail || 'Failed to save module.';
          this.notificationService.error(`${message}`);
        },
      });
    } else {
      // Logic for updating existing modules (PUT)
      const moduleId = this.selectedModuleId();

      const titleUpdate: ModuleDetailsUpdate = {
        title: this.editingModuleTitle,
      };

      this.moduleService.updateModuleDetails(moduleId!, titleUpdate).subscribe({
        next: (res) => {
          // 1. Update the UI Signal
          // We only change the title of the specific module that matches the ID
          this.modules.update((list) =>
            list.map((m) => (m.id === res.id ? { ...m, title: res.title } : m)),
          );

          // 2. Update the Backup Snapshot
          // This ensures "Discard" now considers this new title as the "Last Saved" state
          this.rawCourseResponse.update((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              modules:
                prev.modules?.map((m) => (m.id === res.id ? { ...m, title: res.title } : m)) || [],
            };
          });

          this.notificationService.success('Module details updated');
        },
      });
    }
  }

  // Core state for the Step being edited
  editingStepType = signal<'LESSON' | 'QUIZ'>('LESSON');
  editingStepTitle = signal<string>('');
  editingStepContent = signal<string>(''); // The "master" string for the DB
  editingResources = signal<LearningStepResource[]>([]);
  isCreatingStep = false;
  selectedStepId = signal<string | null>(null);
  selectedModuleId = signal<string | null>(null);

  private calculateDynamicSequence(moduleId: string): number {
    const module = this.modules().find((m) => m.id === moduleId);
    if (!module?.learningSteps?.length) {
      return 1;
    }

    const sequences = module.learningSteps.map((s) => s.sequence || 0);
    const maxSequence = Math.max(...sequences);
    return maxSequence + 1;
  }

  // State tracking signals
  isUploading = signal<boolean>(false);
  contentTouched = false;

  // Add this to your component class
  isVideoLesson = signal(false);
  mainLessonVideo = signal<{
    file: File | null;
    progress: number;
    uploadId?: string | null;
  }>({
    file: null,
    progress: 0,
    uploadId: null,
  });

  isContentEnabled = signal(false);
  isMaterialsEnabled = signal(false);

  // State for the "Pre-upload" phase
  selectedVideoFile = signal<File | null>(null);

  onMainVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedVideoFile.set(file);
      // Reset progress for the new selection
      this.mainLessonVideo.update((v) => ({ ...v, progress: 0, file: file }));
    }
  }

  // Add these to your component
  isSyncingToCloud = signal(false);
  isUploadComplete = signal(false);
  currentUploadId = signal<string | null>(null);

  async startVideoUpload() {
    const file = this.selectedVideoFile();
    if (!file) return;

    try {
      this.isSyncingToCloud.set(true);

      const response = await firstValueFrom(this.muxService.getUploadUrl());

      // --- MATCH THE LOG STRUCTURE ---
      // The log shows: data { id: "...", url: "..." }
      const uploadId = response.data.id;
      const uploadUrl = response.data.url;

      if (!uploadId) {
        console.error('Mux ID missing in response:', response);
        throw new Error('Could not retrieve Mux Upload ID');
      }

      console.log('Successfully captured Mux ID:', uploadId);
      // Store it so removeVideo() can find it
      this.currentUploadId.set(uploadId);

      // 2. Upload the bytes
      await this.muxService.uploadToMux(file, uploadUrl);

      this.isUploadComplete.set(true);
      this.isSyncingToCloud.set(false);
    } catch (error) {
      this.isSyncingToCloud.set(false);
      console.error('Upload failed', error);
      this.notificationService.error('Upload failed');
    }
  }

  isDeleting = signal(false); // Add this signal

  currentAssetId = signal<string | null>(null);

  async removeVideo() {
    const uploadId = this.currentUploadId();
    const assetId = this.currentAssetId(); // ← you already have this signal

    if (this.isDeleting()) return;

    this.isDeleting.set(true);

    try {
      if (assetId) {
        // Video is already processed → delete the Asset (this is what removes it permanently)
        await firstValueFrom(this.muxService.deleteMuxAsset(assetId));
        console.log('Deleted Mux Asset:', assetId);
      } else if (uploadId) {
        // Still in upload state → delete the Upload
        await firstValueFrom(this.muxService.deleteMuxUpload(uploadId));
        console.log('Deleted Mux Upload:', uploadId);
      } else {
        console.log('No assetId or uploadId found to delete.');
      }

      this.notificationService.info('Video removed from cloud');
    } catch (error) {
      console.error('Failed to delete from Mux:', error);
      this.notificationService.error('Failed to delete video from cloud, but UI cleared');
    } finally {
      // Always reset UI state even if delete failed
      this.isDeleting.set(false);
      this.selectedVideoFile.set(null);
      this.isUploadComplete.set(false);
      this.isSyncingToCloud.set(false);
      this.currentUploadId.set(null);
      this.currentAssetId.set(null);
      this.currentPlaybackId.set(null); // ← important: clear player
      this.mainLessonVideo.update((v) => ({ ...v, file: null, uploadId: null }));
    }
  }

  // A Map where the KEY is the actual Resource object and the VALUE is the loading status
  loadingStates = new Map<LearningStepResource, boolean>();

  async confirmUpload(resource: LearningStepResource) {
    const localFile = (resource as any).tempFile;

    // CONCEPT 1: Functional Guard (Prevents the Loop)
    // If we are already syncing this specific resource, exit immediately.
    if (!localFile || this.loadingStates.get(resource)) return;

    try {
      // CONCEPT 2: Explicit Syncing State
      this.loadingStates.set(resource, true);

      // CONCEPT 3: Data Retrieval (Presigned URL)
      const response = await firstValueFrom(
        this.s3Service.getPresignedUrl(localFile.name, localFile.type),
      );

      // CONCEPT 4: Byte Transfer
      await this.s3Service.uploadToStorage(localFile, response.uploadUrl);

      // CONCEPT 5: Signal Update (Immutable Update)
      // We update the array signal to reflect the new permanent S3 data
      this.editingResources.update((resources) =>
        resources.map((res) => {
          if (res === resource) {
            // Create a clean version of the object
            const updated = {
              ...res,
              objectKey: response.objectKey,
              contentType: localFile.type,
              size: localFile.size,
            };

            console.log('Resource updated with cloud data:', updated);

            // Remove the temporary file trigger
            delete (updated as any).tempFile;
            return updated;
          }
          return res;
        }),
      );
    } catch (error) {
      console.error('Material sync failed:', error);
      this.notificationService.error('Upload failed');
    } finally {
      // CONCEPT 6: Finalize State
      this.loadingStates.delete(resource);
    }
  }

  addAttachment() {
    const resources = this.editingResources();

    // Use (r as any) to check the temporary file property
    const hasPendingUpload = resources.some(
      (r) => ((r as any).file && !r.objectKey) || this.loadingStates.has(r),
    );

    if (hasPendingUpload) {
      this.notificationService.info(
        'Please confirm or cancel the current upload before adding another',
      );
      return;
    }

    // If clean, add the new empty row
    this.editingResources.update((prev) => [
      ...prev,
      {
        name: '',
        objectKey: '',
        contentType: '',
        size: 0,
      },
    ]);
  }
  // Add this to your component class
  deletingStates = new Set<any>();

  async removeAttachment(index: number) {
    const resource = this.editingResources()[index];
    if (!resource) return;

    try {
      // 1. Mark this specific resource as deleting
      this.deletingStates.add(resource);

      // 2. Cloud Cleanup (if it exists in RustFS)
      if (resource.objectKey) {
        await firstValueFrom(this.s3Service.deleteFile(resource.objectKey));
        this.notificationService.info('Material purged from cloud');
      }

      // 3. UI Cleanup
      this.editingResources.update((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Purge failed', error);
      this.notificationService.error('Could not clear cloud storage');
    } finally {
      // 4. Always unmark (though if removed from array, the element disappears anyway)
      this.deletingStates.delete(resource);
    }
  }

  onFileSelected(event: any, attachment: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation Logic
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType || file.size > 500 * 1024 * 1024) {
      this.notificationService.info('Invalid file or file too large (Max 10MB)');
      return;
    }

    // MUST match the name used in @else if (!$any(file).tempFile)
    attachment.tempFile = file;

    if (!attachment.name) {
      attachment.name = file.name;
    }
  }

  // In your component
  isSystemLocked = computed(() => {
    return (
      this.editingResources().some((res) => !!(res as any).tempFile) || this.loadingStates.size > 0
    );
  });

  // Add near your other signals (after isSystemLocked for example)
  hasPendingUploads = computed(() => {
    const hasVideoUploading =
      this.isSyncingToCloud() ||
      (this.isVideoLesson() && !!this.selectedVideoFile() && !this.isUploadComplete());

    const hasMaterialUploading =
      this.loadingStates.size > 0 ||
      this.editingResources().some((r) => !!(r as any).tempFile && !r.objectKey);

    return hasVideoUploading || hasMaterialUploading;
  });

  // Signal to track the IDs of the modules that are currently open
  // 1. Change to a Set to track multiple open IDs
  expandedModuleIds = signal<Set<string>>(new Set());

  toggleModuleStructure(moduleId: string, event: Event) {
    event.stopPropagation();

    // DEBUG: See if data exists when you click
    const mod = this.modules().find((m) => m.id === moduleId);
    console.log('Expanding Module:', moduleId, 'Steps found:', mod?.learningSteps?.length);

    this.expandedModuleIds.update((prevSet) => {
      // We create a new Set to trigger the signal update (immutability)
      const newSet = new Set(prevSet);

      if (newSet.has(moduleId)) {
        newSet.delete(moduleId); // Close it
      } else {
        newSet.add(moduleId); // Open it
      }
      return newSet;
    });
  }

  // Dragging Modules
  onModuleDrop(event: CdkDragDrop<any[]>) {
    this.modules.update((currentModules) => {
      const newModules = [...currentModules];
      moveItemInArray(newModules, event.previousIndex, event.currentIndex);
      return newModules;
    });
  }

  isPublishingCourse = signal(false);

  publishCourse() {
    const courseId = this.courseId();
    if (!courseId) {
      this.notificationService.error('Please save the course first');
      return;
    }

    if (!this.isReadyToPublish()) {
      this.showValidationErrors = true;
      this.notificationService.info(
        'Please complete all required fields before publishing the course',
      );
      return;
    }

    this.isPublishingCourse.set(true);

    this.courseService
      .publishCourse(courseId)
      .pipe(finalize(() => this.isPublishingCourse.set(false)))
      .subscribe({
        next: (updatedCourse: CourseResponse) => {
          // Sync the full course data
          this.syncSignals(updatedCourse);

          // Optional: Update modules if backend returns them too
          if (updatedCourse.modules) {
            this.modules.set(
              updatedCourse.modules
                .map((mod) => ({
                  ...mod,
                  learningSteps: mod.learningSteps
                    ? [...mod.learningSteps].sort((a, b) => a.sequence - b.sequence)
                    : [],
                }))
                .sort((a, b) => a.sequence - b.sequence),
            );
          }

          this.notificationService.success('Course published successfully! It is now live.');

          // Optional: Refresh the top nav button state
          this.isReadyToPublish(); // just to re-evaluate
        },
        error: (err: any) => {
          const message = err?.error?.detail || 'Failed to publish course. Please try again.';
          this.notificationService.error(message);
          console.error('Publish course error:', err);
        },
      });
  }
  /**
   *
   *
   *
   * MODULE
   *
   *
   */

  // Component Signal
  moduleTab = signal<'DETAILS' | 'STRUCTURE'>('DETAILS');

  reorderModuleSequence() {
    const courseId = this.courseId(); // Assuming you have this signal/variable
    const currentDraft = this.modules(); // The new order in the UI

    // Create the payload: Array of { moduleId, sequence }
    const reorderPayload = this.modules().map((mod, index) => ({
      moduleId: mod.id,
      sequence: index + 1, // Starts at 1 for the database
    }));

    // Call the single API endpoint
    this.courseService.reorderModuleSequence(courseId!, reorderPayload).subscribe({
      next: () => {
        this.notificationService.success('Curriculum structure saved successfully');
        // Update local state if the backend returns the new sorted list

        // 2. IMPORTANT: Update the internal sequence property of each module
        // so the next 'Discard' sort actually works correctly.
        const updatedModules = currentDraft.map((mod, index) => ({
          ...mod,
          sequence: index + 1, // Synchronize the object with its new position
        }));

        // 3. Update the backup with the modules that now have CORRECT sequences
        this.rawCourseResponse.update((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            modules: updatedModules,
          };
        });

        // Also update the active UI signal to ensure everything is in sync
        this.modules.set(updatedModules);
      },
      error: (err) => {
        console.log('Reorder failed. Error:', err);
        this.notificationService.error('Failed to reorder module sequence');
      },
    });
  }

  discardModuleReorder() {
    const backup = this.rawCourseResponse();

    if (backup && backup.modules) {
      // Just use the array exactly as it was stored in the backup
      // We sort it just in case, but now the sequences will be correct
      const restored = [...backup.modules].sort((a, b) => a.sequence - b.sequence);

      this.modules.set(restored);
      this.notificationService.info('Reverted to last saved order');
    }
  }

  isPublishingModule = signal(false);
  isDeletingModule = signal(false);

  // ==================== MODULE PUBLISH ====================
  publishModule(): void {
    const moduleId = this.selectedModuleId();
    if (!moduleId || moduleId === 'NEW') {
      this.notificationService.error('Please save the module first');
      return;
    }

    const selectedModule = this.getSelectedModule();
    if (!selectedModule?.isReadyToPublish) {
      this.notificationService.error('Module is not ready to publish yet');
      return;
    }

    this.isPublishingModule.set(true);

    this.moduleService
      .publishModule(moduleId)
      .pipe(finalize(() => this.isPublishingModule.set(false)))
      .subscribe({
        next: (updatedModule: ModuleResponse) => {
          // Update main list
          this.modules.update((mods) =>
            mods.map((m) =>
              m.id === moduleId ? { ...updatedModule, learningSteps: m.learningSteps } : m,
            ),
          );

          // Update backup
          this.rawCourseResponse.update((course) => {
            if (!course?.modules) return course;
            return {
              ...course,
              modules: course.modules.map((m) =>
                m.id === moduleId ? { ...updatedModule, learningSteps: m.learningSteps } : m,
              ),
            };
          });

          this.notificationService.success('Module published successfully!');
          this.selectModule(updatedModule); // Refresh view
        },
        error: (err) => {
          this.notificationService.error(err?.error?.detail || 'Failed to publish module');
        },
      });
  }

  // ==================== MODULE DELETE MODAL ====================
  confirmDeleteModule(): void {
    const moduleId = this.selectedModuleId();
    if (!moduleId || moduleId === 'NEW') {
      this.notificationService.error('Cannot delete an unsaved module');
      return;
    }

    const module = this.modules().find((m) => m.id === moduleId);
    if (module) {
      this.moduleToDelete.set(module);
    }
  }

  cancelModuleDelete(): void {
    this.moduleToDelete.set(null);
  }

  executeDeleteModule(): void {
    const module = this.moduleToDelete();
    if (!module) return;

    this.isDeletingModule.set(true);

    this.moduleService
      .deleteModule(module.id)
      .pipe(
        finalize(() => {
          this.isDeletingModule.set(false);
          this.moduleToDelete.set(null);
        }),
      )
      .subscribe({
        next: () => {
          // Remove from UI modules list
          this.modules.update((mods) => mods.filter((m) => m.id !== module.id));

          // Remove from raw backup
          this.rawCourseResponse.update((course) => {
            if (!course?.modules) return course;
            return {
              ...course,
              modules: course.modules.filter((m) => m.id !== module.id),
            };
          });

          // Reset view if we were inside the deleted module
          if (this.selectedModuleId() === module.id) {
            this.selectedModuleId.set(null);
            this.setView('COURSE_IDENTITY');
          }

          this.notificationService.success(`Module "${module.title}" and all its content deleted`);
        },
        error: (err) => {
          this.notificationService.error(err?.error?.detail || 'Failed to delete module');
        },
      });
  }

  // Module Delete Modal
  moduleToDelete = signal<ModuleResponse | null>(null);

  /**
   *
   *
   * LEARNING STEP
   *
   *
   */

  addStep(moduleId: string, type: 'LESSON' | 'QUIZ') {
    if (!moduleId) {
      this.notificationService.info('Please select a valid module');
      return;
    }

    this.isCreatingStep = true;
    this.selectedModuleId.set(moduleId);
    this.selectedStepId.set(null);
    this.editingStepType.set(type);
    this.editingStepTitle.set(type === 'QUIZ' ? 'Untitled Quiz' : 'Untitled Lesson');

    this.clearLessonEditorState();

    if (type === 'QUIZ') {
      this.quizQuestions.set([]);
      this.addQuestion();
    }

    this.setView(type === 'QUIZ' ? 'QUIZ_EDITOR' : 'LESSON_EDITOR');
  }

  getSelectedStep() {
    const modules = this.modules();
    const stepId = this.selectedStepId();

    if (!modules || !stepId) return null;

    for (const m of modules) {
      const found = (m.learningSteps || []).find((s) => s.id === stepId);
      if (found) return found;
    }
    return null;
  }

  selectStep(step: LearningStepResponse) {
    this.isCreatingStep = false;

    this.selectedModuleId.set(step.moduleId);
    this.selectedStepId.set(step.id);

    this.editingStepTitle.set(step.title);
    this.editingStepType.set(step.type as 'LESSON' | 'QUIZ');

    if (step.type === 'LESSON' && step.content) {
      this.editingStepContent.set(step.content || '');

      //  Hydrate Toggle States (Crucial for the UI switches)
      this.isVideoLesson.set(step.videoEnabled);
      this.isContentEnabled.set(step.contentEnabled);
      this.isMaterialsEnabled.set(step.materialsEnabled);

      if (step.videoPlaybackId) {
        this.currentPlaybackId.set(step.videoPlaybackId);
        this.isUploadComplete.set(true);
      } else {
        this.currentPlaybackId.set(null);
        this.isUploadComplete.set(false);
      }

      this.currentAssetId.set(step.videoAssetId || null);

      // Hydrate Resources/Attachments
      this.editingResources.set(step.resources ? [...step.resources] : []);
    } else if (step.type === 'QUIZ') {
      // Preserve questions even if backend response is minimal
      if (step.quiz?.questions && step.quiz.questions.length > 0) {
        this.quizQuestions.set([...step.quiz.questions]);
      }
      // If quiz data is missing, keep current questions (important after publish)
      else if (this.quizQuestions().length === 0) {
        // fallback - do nothing, keep what user has
      }
    }

    this.setView(step.type === 'QUIZ' ? 'QUIZ_EDITOR' : 'LESSON_EDITOR');
  }

  private clearLessonEditorState() {
    this.editingStepContent.set('');
    this.editingResources.set([]);
    this.isVideoLesson.set(false);
    this.isContentEnabled.set(false);
    this.isMaterialsEnabled.set(false);

    this.selectedVideoFile.set(null);
    this.isUploadComplete.set(false);
    this.isSyncingToCloud.set(false);
    this.currentPlaybackId.set(null);
    this.currentUploadId.set(null);
    this.currentAssetId.set(null);

    this.mainLessonVideo.set({ file: null, progress: 0, uploadId: null });
    this.loadingStates.clear();
  }

  // Signals for the Player
  currentPlaybackId = signal<string | null>(null);
  currentUserId = signal<string>(''); // Keycloak 'sub'

  editingStepId = signal<string | null>(null);

  // editingQuestions = signal<QuizQuestionRequest[]>([]);

  // The State: Holds the step being edited AND the one pending deletion
  editingStep = signal<LearningStepResponse | null>(null);
  stepToDelete = signal<LearningStepResponse | null>(null);

  // The Confirmation: Sets the target for the Tailwind modal
  confirmDelete(step: LearningStepResponse) {
    this.stepToDelete.set(step);
  }

  // The Cleanup: Wipes the target if they click "Cancel" or "Keep it"
  cancelDelete() {
    this.stepToDelete.set(null);
  }

  executePurge() {
    const step = this.stepToDelete();
    if (!step) return;

    this.isDeleting.set(true);

    this.learningStepService
      .delete(step.id)
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
          this.stepToDelete.set(null);
        }),
      )
      .subscribe({
        next: () => {
          // ✅ 1. Update RAW response (source of truth)
          this.rawCourseResponse.update((course) => {
            if (!course || !course.modules) return course;

            return {
              ...course,
              modules: course.modules.map((m) => ({
                ...m,
                learningSteps: m.learningSteps
                  ? m.learningSteps.filter((s) => s.id !== step.id)
                  : [],
              })),
            };
          });

          // ✅ 2. Update UI state (what your template uses)
          this.modules.update((mods) =>
            mods.map((m) => ({
              ...m,
              learningSteps: m.learningSteps.filter((s) => s.id !== step.id),
            })),
          );

          this.setView('MODULE_STRUCTURE', this.selectedModuleId()); // Refresh the view to reflect changes
          this.notificationService.success('Step and cloud assets purged.');
        },
        error: () => this.notificationService.error('Cleanup failed.'),
      });
  }

  reOrderStepSequence() {
    const moduleId = this.selectedModuleId();
    if (!moduleId) return;

    // 1. Get the current UI state of steps
    const currentSteps = this.getSelectedModule()?.learningSteps || [];

    // 2. Prepare the payload
    const payload = currentSteps.map((step, index) => ({
      learningStepId: step.id,
      sequence: index + 1,
    }));

    console.log('Reordering Steps with payload:', payload);

    this.moduleService.reOrderStepSequence(moduleId, payload).subscribe({
      next: () => {
        this.notificationService.success('Step sequence updated successfully');

        // 3. Update the internal .sequence property of each step
        const updatedSteps = currentSteps.map((step, index) => ({
          ...step,
          sequence: index + 1,
        }));

        // 4. Sync the main modules signal
        this.modules.update((list) =>
          list.map((m) => (m.id === moduleId ? { ...m, learningSteps: updatedSteps } : m)),
        );

        // 5. Sync the Backup Snapshot (rawCourseResponse)
        // This is vital so 'Discard' doesn't revert to the old step order
        this.rawCourseResponse.update((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            modules:
              prev.modules?.map((m) =>
                m.id === moduleId ? { ...m, learningSteps: updatedSteps } : m,
              ) || [],
          };
        });
      },
      error: (err) => {
        this.notificationService.error(err.error?.detail || 'Failed to reorder steps');
      },
    });
  }

  discardStepReorder() {
    const moduleId = this.selectedModuleId();
    const backup = this.rawCourseResponse();

    if (!moduleId || !backup || !backup.modules) return;

    // 1. Find the module in the backup that matches our current selection
    const backupModule = backup.modules.find((m) => m.id === moduleId);

    if (backupModule && backupModule.learningSteps) {
      // 2. Sort the backup steps by their saved sequence
      const originalStepOrder = [...backupModule.learningSteps].sort(
        (a, b) => a.sequence - b.sequence,
      );

      // 3. Update only this module's steps in the main UI signal
      this.modules.update((list) =>
        list.map((m) => (m.id === moduleId ? { ...m, learningSteps: originalStepOrder } : m)),
      );

      this.notificationService.info('Steps reverted to last saved order');
    }
  }

  onStepDrop(event: CdkDragDrop<any>) {
    const containerData = event.container.data;
    if (!containerData) return;

    // Find which module this drop happened in
    const moduleId = this.selectedModuleId(); // or derive it from the container if possible

    this.modules.update((currentModules) => {
      return currentModules.map((module) => {
        // Only update the module that contains the dropped steps
        if (module.id === moduleId && module.learningSteps) {
          const newSteps = [...module.learningSteps]; // shallow copy
          moveItemInArray(newSteps, event.previousIndex, event.currentIndex);

          return {
            ...module,
            learningSteps: newSteps,
          };
        }
        return module;
      });
    });
  }

  /*
   * QUIZ
   */

  // UI-Specific state (only used when type === 'QUIZ')
  quizQuestions = signal<QuizQuestionRequest[]>([]);

  // 1. Add a new Question with 2 default options
  addQuestion() {
    const newQuestion = {
      questionText: '',
      hasMultipleAnswers: false,
      answerOptions: [
        { answerText: '', isCorrect: true }, // One default correct
        { answerText: '', isCorrect: false },
      ],
    };
    this.quizQuestions.update((qs) => [...qs, newQuestion]);
  }

  // 2. Remove a Question
  removeQuestion(qIdx: number) {
    this.quizQuestions.update((qs) => qs.filter((_, i) => i !== qIdx));
  }

  // 3. Add an Option to a specific Question
  addOption(qIdx: number) {
    const qs = [...this.quizQuestions()];
    qs[qIdx].answerOptions.push({ answerText: '', isCorrect: false });
    this.quizQuestions.set(qs);
  }

  // 4. Remove an Option (Min 2 constraint)
  removeOption(qIdx: number, oIdx: number) {
    const qs = [...this.quizQuestions()];
    if (qs[qIdx].answerOptions.length > 2) {
      qs[qIdx].answerOptions.splice(oIdx, 1);
      this.quizQuestions.set(qs);
    }
  }

  // 5. Handle Choice Logic (Radio vs Checkbox behavior)
  handleOptionToggle(qIdx: number, oIdx: number) {
    this.quizQuestions.update((qs) => {
      // Create a shallow copy of the questions array
      const updatedQs = [...qs];
      const question = updatedQs[qIdx];

      // 1. Handle the "Allow Multiple" toggle switch
      if (oIdx === -1) {
        if (!question.hasMultipleAnswers) {
          // If switching to SINGLE CHOICE: Keep only the first correct answer found
          let foundCorrect = false;
          question.answerOptions.forEach((opt) => {
            if (opt.isCorrect && !foundCorrect) {
              foundCorrect = true;
            } else {
              opt.isCorrect = false;
            }
          });
          // Safety: If none were correct, default the first one
          if (!foundCorrect && question.answerOptions.length > 0) {
            question.answerOptions[0].isCorrect = true;
          }
        }
        return updatedQs;
      }

      // 2. Handle clicking an answer option
      if (question.hasMultipleAnswers) {
        // Toggle logic: If it was true, make it false. If false, make it true.
        question.answerOptions[oIdx].isCorrect = !question.answerOptions[oIdx].isCorrect;
      } else {
        // Radio logic: Set only the clicked one to true, all others to false
        question.answerOptions.forEach((opt, i) => {
          opt.isCorrect = i === oIdx;
        });
      }

      return updatedQs;
    });
  }

  getCorrectCount(qIdx: number): number {
    return this.quizQuestions()[qIdx].answerOptions.filter((o: any) => o.isCorrect).length;
  }

  isPublishing = signal<boolean>(false);

  publishStep() {
    const step = this.getSelectedStep();
    if (!step) {
      this.notificationService.error('No step selected');
      return;
    }

    if (!step.readyToPublish) {
      this.notificationService.error('This step is not ready to publish yet.');
      return;
    }

    this.isPublishing.set(true);

    this.learningStepService.publishLearningStep(step.id).subscribe({
      next: (updatedStep: LearningStepResponse) => {
        this.notificationService.success('Step published successfully!');
        this.isPublishing.set(false);

        // Update modules list
        this.modules.update((modules) =>
          modules.map((module) =>
            module.id === this.selectedModuleId()
              ? {
                  ...module,
                  learningSteps: module.learningSteps?.map((s) =>
                    s.id === step.id ? { ...updatedStep } : s,
                  ),
                }
              : module,
          ),
        );

        // CRITICAL FIX: Preserve quiz questions before refreshing view
        if (updatedStep.type === 'QUIZ' && updatedStep.quiz?.questions) {
          this.quizQuestions.set([...updatedStep.quiz.questions]);
        }

        // Refresh current view with updated step
        this.selectStep(updatedStep);
      },
      error: (err: any) => {
        this.isPublishing.set(false);
        this.notificationService.error(err?.error?.detail || 'Failed to publish step');
      },
    });
  }

  saveStep() {
    if (this.isSaving()) return;

    // === NEW: BLOCK SAVE DURING UPLOADS ===
    if (this.hasPendingUploads()) {
      this.notificationService.info(
        'Please wait for all uploads (video and materials) to complete before saving.',
      );
      return;
    }

    this.isSaving.set(true);
    this.showValidationErrors = false;

    const type = this.editingStepType();
    const title = this.editingStepTitle()?.trim();
    const moduleId = this.selectedModuleId(); // ← Get it once
    const stepId = this.selectedStepId();
    const isEdit = !!stepId;

    const isVideo = this.isVideoLesson();
    const isContent = this.isContentEnabled();
    const isMaterials = this.isMaterialsEnabled();

    // === GUARD: Module Existence ===
    if (!moduleId) {
      this.notificationService.error('Please select a module before saving the step.');
      this.isSaving.set(false);
      return;
    }

    // === COMMON VALIDATION ===
    if (!title) {
      this.showValidationErrors = true;
      this.notificationService.error('Title is required.');
      this.isSaving.set(false);
      return;
    }

    let request: LearningStepRequest | LearningStepUpdateRequest | null = null;

    if (type === 'LESSON') {
      // Cloud Sync Guard
      if (this.muxService.isUploading?.() || this.loadingStates.size > 0) {
        this.notificationService.info('Please wait for media uploads to finish.');
        this.isSaving.set(false);
        return;
      }

      const rawContent = this.editingStepContent();
      const currentResources = this.editingResources();

      const isEditorEmpty = !rawContent || rawContent.replace(/<[^>]*>/g, '').trim().length === 0;

      const hasValidVideo = isVideo && !!this.currentUploadId();
      const hasValidContent = isContent && !isEditorEmpty;
      const hasValidMaterials = isMaterials && currentResources.length > 0;

      if (!hasValidVideo && !hasValidContent && !hasValidMaterials) {
        this.notificationService.error('A lesson must have at least one content section.');
        this.isSaving.set(false);
        return;
      }

      if (isMaterials) {
        const hasInvalid = currentResources.some((r) => !r.objectKey);
        if (hasInvalid) {
          this.notificationService.error(
            'Some materials are missing upload data. Please re-upload them.',
          );
          this.isSaving.set(false);
          return;
        }
      }

      if (isEdit) {
        // UPDATE existing step
        let videoUploadIdToSend: string | null | undefined = undefined;

        if (isVideo) {
          if (this.currentUploadId()) {
            videoUploadIdToSend = this.currentUploadId()!;
          } else if (this.selectedVideoFile()) {
            this.notificationService.error('Please upload the new video first before saving.');
            this.isSaving.set(false);
            return;
          }
        } else {
          videoUploadIdToSend = null; // clear video
        }

        request = {
          title,
          type: 'LESSON',
          videoEnabled: isVideo,
          contentEnabled: isContent,
          materialsEnabled: isMaterials,
          videoUploadId: videoUploadIdToSend,
          content: hasValidContent && isContent ? rawContent : '',
          resources:
            hasValidMaterials && isMaterials
              ? currentResources.map((res) => ({
                  name: res.name,
                  objectKey: res.objectKey!,
                  contentType: res.contentType,
                  size: res.size,
                }))
              : [],
        } as LearningStepUpdateRequest;
      } else {
        // CREATE new step
        request = {
          moduleId: moduleId!, // ← Now safe
          title,
          type: 'LESSON',
          sequence: this.calculateDynamicSequence(moduleId!),
          videoEnabled: isVideo,
          contentEnabled: isContent,
          materialsEnabled: isMaterials,
          content: hasValidContent ? rawContent : '',
          videoUploadId: this.currentUploadId() || undefined,
          resources: hasValidMaterials
            ? currentResources.map((res) => ({
                name: res.name,
                objectKey: res.objectKey!,
                contentType: res.contentType,
                size: res.size,
              }))
            : [],
        } as LearningStepRequest;
      }
    }

    // === QUIZ HANDLING ===
    if (type === 'QUIZ') {
      const quizQuestions = this.quizQuestions(); // Your Signal<QuizQuestion[]>

      // 1. Basic Validation
      if (!quizQuestions || quizQuestions.length === 0) {
        this.notificationService.error('A quiz must have at least one question.');
        this.isSaving.set(false);
        return;
      }

      // 2. Multi-Answer & Correctness Validation Logic
      for (const [index, q] of quizQuestions.entries()) {
        const correctCount = q.answerOptions.filter((opt) => opt.isCorrect).length;
        const questionLabel = q.questionText?.trim() || `Question ${index + 1}`;

        // Ensure question has text
        if (!q.questionText?.trim()) {
          this.notificationService.error(`Question ${index + 1} text is required.`);
          this.isSaving.set(false);
          return;
        }

        // Must have at least one correct answer
        if (correctCount === 0) {
          this.notificationService.error(
            `"${questionLabel}" must have at least one correct answer.`,
          );
          this.isSaving.set(false);
          return;
        }

        // STRICT MULTI-ANSWER VALIDATION
        // If toggle is OFF (Single Choice), but user selected > 1 answer
        if (!q.hasMultipleAnswers && correctCount > 1) {
          this.notificationService.error(
            `"${questionLabel}" is set to single choice, but you've selected ${correctCount} correct answers.`,
          );
          this.isSaving.set(false);
          return;
        }
      }

      // 3. Map to Backend Request Interface
      const quizRequestData: QuizQuestionRequest[] = quizQuestions.map((q) => ({
        questionText: q.questionText,
        hasMultipleAnswers: q.hasMultipleAnswers,
        answerOptions: q.answerOptions.map((opt) => ({
          answerText: opt.answerText,
          isCorrect: opt.isCorrect,
        })),
      }));

      if (isEdit) {
        request = {
          title,
          type: 'QUIZ',
          videoEnabled: false,
          contentEnabled: false,
          materialsEnabled: false,
          questions: quizRequestData,
        } as LearningStepUpdateRequest;
      } else {
        request = {
          moduleId: moduleId!,
          title,
          type: 'QUIZ',
          sequence: this.calculateDynamicSequence(moduleId!),
          videoEnabled: false,
          contentEnabled: false,
          materialsEnabled: false,
          questions: quizRequestData,
        } as LearningStepRequest;
      }
    }

    if (!request) {
      this.isSaving.set(false);
      return;
    }

    const operation$ = isEdit
      ? this.learningStepService.updateLearningStep(stepId!, request as LearningStepUpdateRequest)
      : this.learningStepService.createLearningStep(request as LearningStepRequest);

    operation$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (res: LearningStepResponse) => {
        this.notificationService.success(`${type} ${isEdit ? 'updated' : 'created'} successfully`);

        // Update modules list + backup (your existing logic)
        this.modules.update((currentModules) =>
          currentModules.map((module) => {
            if (module.id === moduleId) {
              const currentSteps = [...(module.learningSteps || [])];
              let updatedSteps = isEdit
                ? currentSteps.map((step) => (step.id === res.id ? { ...res } : step))
                : [...currentSteps, { ...res }];

              updatedSteps.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

              return { ...module, learningSteps: updatedSteps };
            }
            return module;
          }),
        );

        // === IMPORTANT: Handle Quiz Questions specifically ===
        if (type === 'QUIZ' && res.quiz) {
          this.quizQuestions.set(res.quiz.questions || []); // ← Map from response
        }

        // Update raw backup too...
        this.rawCourseResponse.update((prev) => {
          if (!prev?.modules) return prev;
          return {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === moduleId
                ? {
                    ...m,
                    learningSteps: isEdit
                      ? (m.learningSteps || []).map((s) => (s.id === res.id ? res : s))
                      : [...(m.learningSteps || []), res].sort((a, b) => a.sequence - b.sequence),
                  }
                : m,
            ),
          };
        });

        // 3. CRITICAL: Refresh the module title in the editor
        const currentModule = this.modules().find((m) => m.id === moduleId);
        if (currentModule) {
          this.editingModuleTitle = currentModule.title; // ← This fixes "Untitled Module"
        }

        // Also update the current step title in the editor
        this.editingStepTitle.set(
          res.title || (type === 'LESSON' ? 'Untitled Lesson' : 'Untitled Quiz'),
        );

        this.clearLessonEditorState();
        this.setView('MODULE_STRUCTURE', moduleId);
      },
      error: (err: any) => {
        this.notificationService.error(
          err?.error?.detail || `Failed to ${isEdit ? 'update' : 'create'} step.`,
        );
        console.error(err);
      },
    });
  }
}
