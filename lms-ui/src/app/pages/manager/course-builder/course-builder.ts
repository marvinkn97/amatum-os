import { Component, signal, inject, OnInit, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CourseResponse, CourseService } from '../../../services/course.service';
import { finalize, firstValueFrom, map } from 'rxjs';
import { CategoryService, CourseCategoryResponse } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModuleRequest, ModuleResponse, ModuleService } from '../../../services/module.service';
import {
  LearningStepResourceRequest,
  LearningStepRequest,
  LearningStepResponse,
  LearningStepService,
} from '../../../services/learning-step.service';
import { MuxService } from '../../../services/mux.service';
import { S3Service } from '../../../services/s3.service';

type StudioView = 'COURSE_IDENTITY' | 'MODULE_STRUCTURE' | 'LESSON_EDITOR' | 'QUIZ_EDITOR';

interface Lesson {
  id: string;
  title: string;
  type: 'LESSON' | 'QUIZ';
  content?: string;
}

interface StudioNotification {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

@Component({
  selector: 'app-course-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, DragDropModule],
  template: `
    <div
      class="flex flex-col w-full h-full bg-[#030712] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30"
    >
      @if (notification().visible) {
        <div class="fixed top-6 right-6 z-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            [class]="
              'flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ' +
              (notification().type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : notification().type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400')
            "
          >
            <div
              class="size-2 rounded-full animate-pulse"
              [class]="
                notification().type === 'success'
                  ? 'bg-emerald-500'
                  : notification().type === 'error'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
              "
            ></div>
            <span class="text-[11px] font-black uppercase tracking-[0.15em]">{{
              notification().message
            }}</span>
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
          @if (isReadyToPublish()) {
            <button
              (click)="publishCourse()"
              class="group flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded-xl transition-all cursor-pointer"
            >
              <span
                class="text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-white"
              >
                Publish
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
            </button>
          } @else {
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
                      class="text-xs font-bold truncate max-w-40"
                      [class.text-indigo-400]="selectedId() === module.id"
                      >{{ module.title }}</span
                    >
                    <svg
                      class="size-3 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-width="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div class="bg-black/20 px-2 pb-2 space-y-1">
                    @for (step of module.steps; track step.id) {
                      <button
                        (click)="selectStep(step); isSidebarOpen.set(false)"
                        [class.bg-indigo-500/10]="selectedId() === step.id"
                        [class.text-white]="selectedId() === step.id"
                        class="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          class="size-1.5 rounded-full"
                          [class.bg-amber-500]="step.type === 'QUIZ'"
                          [class.bg-indigo-500]="step.type === 'LESSON'"
                        ></div>
                        <span class="truncate">{{ step.title }}</span>
                      </button>
                    }
                  </div>
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
              <div class="space-y-12 lg:space-y-16">
                <header>
                  <h2 class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">
                    Course Outline
                  </h2>
                  <p class="text-slate-500 text-sm font-medium mt-2">
                    Provide the general info and pricing.
                  </p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                  <div class="space-y-3 col-span-1 md:col-span-2">
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                        Promote to public view
                      </h4>
                      <p class="text-[10px] text-slate-500 font-medium">
                        Pin this course to the front page featured section.
                      </p>
                    </div>
                    <button
                      (click)="courseData().featured = !courseData().featured"
                      [class.bg-indigo-600]="courseData().featured"
                      class="w-14 h-7 rounded-full border border-white/10 transition-all relative p-1 cursor-pointer"
                    >
                      <div
                        class="size-5 bg-white rounded-full transition-all shadow-lg"
                        [class.translate-x-7]="courseData().featured"
                      ></div>
                    </button>
                  </div>

                  <div class="col-span-1 md:col-span-2 space-y-4 pt-6">
                    <label class="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
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
                      class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            }

            @if (activeView() === 'MODULE_STRUCTURE') {
              <div class="space-y-10">
                <header>
                  <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest"
                    >Module Outline</span
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingModuleTitle"
                    (focus)="$any($event.target).select()"
                    class="bg-transparent border-none outline-none text-2xl lg:text-2xl font-black text-white italic tracking-tighter w-full mt-2"
                  />
                </header>

                <div class="space-y-4">
                  @if (isCreatingNew) {
                    <div class="w-full py-1.5 animate-in fade-in slide-in-from-top-2 duration-1000">
                      <div
                        class="relative p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-md overflow-hidden"
                      >
                        <div class="flex flex-col gap-3">
                          <div class="flex items-center gap-3">
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
                            <span
                              class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500"
                            >
                              Module Configuration
                            </span>
                          </div>

                          <p
                            class="text-[10px] font-bold tracking-widest text-slate-400/80 leading-relaxed"
                          >
                            Provide a module title above & save to enable the curriculum builder
                          </p>
                        </div>
                      </div>
                    </div>
                  } @else {
                    @for (step of getSelectedModule()?.steps; track step.id; let i = $index) {
                      <div
                        class="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white/2 border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                      >
                        <div class="flex items-center gap-4 flex-1">
                          <span class="text-slate-700 font-black italic text-lg">0{{ i + 1 }}</span>
                          <div class="flex-1">
                            <input
                              [(ngModel)]="step.title"
                              class="bg-transparent border-none outline-none text-sm font-bold text-white w-full"
                            />
                          </div>
                        </div>
                        <button
                          (click)="selectStep(step)"
                          class="w-full sm:w-auto px-4 py-2.5 text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Edit Content
                        </button>
                      </div>
                    }
                    <div class="grid grid-cols-2 gap-4 mt-8">
                      <button
                        (click)="addStep(selectedId()!, 'LESSON')"
                        class="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer"
                      >
                        <span
                          class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400"
                          >+ Add Lesson</span
                        >
                      </button>

                      <button
                        (click)="addStep(selectedId()!, 'QUIZ')"
                        class="group flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer"
                      >
                        <span
                          class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400"
                          >+ Add Quiz</span
                        >
                      </button>
                    </div>
                  }
                </div>
                <div
                  class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] via-[#030712]/95 to-transparent pt-10 pb-6 lg:pb-0 px-4 lg:px-0 z-30 border-t border-white/5 lg:border-none"
                >
                  <div class="max-w-4xl mx-auto flex items-center justify-end">
                    <button
                      (click)="saveModule()"
                      class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
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
                      class="bg-transparent border-none outline-none text-2xl lg:text-2xl font-black text-white italic tracking-tighter w-full placeholder:text-slate-900 focus:placeholder:text-transparent transition-all"
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
                    (click)="setView('MODULE_STRUCTURE', selectedId())"
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
                      Video Lesson
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
                        Video Asset Management
                      </h3>
                    </div>

                    <div
                      class="group relative p-12 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-center"
                    >
                      @if (isSyncingToCloud()) {
                        <div class="space-y-6 animate-in fade-in duration-500 py-4">
                          <div class="flex flex-col items-center justify-center space-y-6">
                            <div class="relative size-16">
                              <div
                                class="absolute inset-0 border-4 border-indigo-500/10 rounded-2xl"
                              ></div>
                              <div
                                class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-2xl animate-spin"
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
                      } @else if (isUploadComplete()) {
                        <div
                          class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                        >
                          <div class="flex flex-col items-center space-y-3">
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
                                >Verified at Mux</span
                              >
                            </div>
                            <p class="text-sm font-black text-white italic tracking-tight">
                              {{ selectedVideoFile()?.name }}
                            </p>
                          </div>

                          <button
                            (click)="removeVideo()"
                            [disabled]="isDeleting()"
                            class="px-8 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                            [class.text-rose-500]="!isDeleting()"
                            [class.bg-rose-500/5]="!isDeleting()"
                            [class.text-slate-500]="isDeleting()"
                            [class.cursor-not-allowed]="isDeleting()"
                            [class.opacity-70]="isDeleting()"
                          >
                            @if (isDeleting()) {
                              <div
                                class="size-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"
                              ></div>
                              <span>Clearing Cloud...</span>
                            } @else {
                              <span>Remove & Delete from Cloud</span>
                            }
                          </button>
                        </div>
                      } @else if (!selectedVideoFile()) {
                        <input
                          type="file"
                          class="absolute inset-0 opacity-0 cursor-pointer"
                          (change)="onMainVideoSelected($event)"
                          accept="video/*"
                        />
                        <div class="space-y-4">
                          <div
                            class="size-12 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20"
                          >
                            <svg
                              class="size-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-width="2"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p class="text-sm font-black text-white italic tracking-tight">
                            Select Master Video File
                          </p>
                        </div>
                      } @else {
                        <div class="space-y-6 animate-in fade-in duration-300">
                          <div class="space-y-2">
                            <p class="text-sm font-black text-white italic tracking-tight">
                              {{ selectedVideoFile()?.name }}
                            </p>
                            <p
                              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                            >
                              Ready for secure upload
                            </p>
                          </div>
                          <div class="flex items-center justify-center gap-4">
                            <button
                              (click)="removeVideo()"
                              [disabled]="isDeleting()"
                              class="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                              [class.text-slate-500]="!isDeleting()"
                              [class.hover:text-rose-500]="!isDeleting()"
                              [class.opacity-50]="isDeleting()"
                              [class.cursor-not-allowed]="isDeleting()"
                            >
                              @if (isDeleting()) {
                                <div
                                  class="size-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"
                                ></div>
                                <span>Resetting...</span>
                              } @else {
                                <span>Cancel</span>
                              }
                            </button>
                            <button
                              (click)="startVideoUpload()"
                              class="px-6 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                            >
                              Confirm & Upload
                            </button>
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
                      Resource Materials
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
                          } @else if (file.objectKey) {
                            <div
                              class="space-y-6 animate-in zoom-in duration-500 flex flex-col items-center justify-center"
                            >
                              <div class="flex flex-col items-center space-y-3">
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
                                  placeholder="Material Name"
                                  class="text-sm font-black text-white italic tracking-tight bg-transparent text-center border-none outline-none w-full"
                                />
                              </div>
                              <button
                                (click)="removeAttachment($index)"
                                class="px-8 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10"
                              >
                                <span>Remove & Delete from Cloud</span>
                              </button>
                            </div>
                          } @else if (!$any(file).tempFile) {
                            <div class="space-y-3 animate-in fade-in duration-500">
                              <div class="relative py-0">
                                <input
                                  type="file"
                                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  (change)="onFileSelected($event, file)"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                  [class.cursor-pointer]="!isSystemLocked()"
                                  [class.cursor-not-allowed]="isSystemLocked()"
                                  [disabled]="isSystemLocked()"
                                />
                                <div class="space-y-2">
                                  <div
                                    class="size-10 mx-auto rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20"
                                  >
                                    <svg
                                      class="size-6"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        stroke-width="2"
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div class="space-y-1">
                                    <p class="text-sm font-black text-white italic tracking-tight">
                                      Select Material File
                                    </p>
                                    <input
                                      [(ngModel)]="file.name"
                                      (click)="$event.stopPropagation()"
                                      class="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-transparent text-center border-none outline-none w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div class="flex justify-center">
                                <button
                                  (click)="removeAttachment($index)"
                                  [disabled]="isSystemLocked()"
                                  class="relative z-20 px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer"
                                >
                                  Remove Slot
                                </button>
                              </div>
                            </div>
                          } @else {
                            <div class="space-y-5 animate-in fade-in duration-300">
                              <div class="space-y-2">
                                <p class="text-sm font-black text-white italic tracking-tight">
                                  {{ $any(file).tempFile.name }}
                                </p>
                                <p
                                  class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                                >
                                  Ready for secure upload
                                </p>
                              </div>
                              <div class="flex items-center justify-center gap-4">
                                <button
                                  (click)="$any(file).tempFile = null; file.name = ''"
                                  class="px-8 py-2.5 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all text-slate-500 hover:text-rose-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  (click)="confirmUpload(file)"
                                  class="px-8 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                                >
                                  Confirm & Upload
                                </button>
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
                <div class="flex justify-end pt-12 pb-20 border-t border-white/5">
                  <button
                    (click)="saveStep()"
                    class="w-full lg:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    {{ isSaving() ? 'Saving Changes...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            }
            @if (activeView() === 'QUIZ_EDITOR') {
              <div class="space-y-10">
                <header
                  class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-8 gap-4"
                >
                  <div class="flex-1">
                    <p
                      class="text-indigo-500/60 text-[10px] font-black uppercase tracking-widest mt-2"
                    >
                      Quiz Designer • Multiple Choice
                    </p>
                    <input
                      [(ngModel)]="editingStepTitle"
                      class="bg-transparent border-none outline-none text-xl lg:text-2xl font-black text-white italic tracking-tighter w-full mt-2"
                      placeholder="Quiz Title..."
                    />
                  </div>
                  <button
                    (click)="setView('MODULE_STRUCTURE', selectedId())"
                    class="w-full sm:w-auto px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all"
                  >
                    Back to Module
                  </button>
                </header>

                <div class="space-y-8">
                  @for (question of quizQuestions(); track question.id; let qIdx = $index) {
                    <div
                      class="p-8 bg-white/2 border border-white/5 rounded-4xl space-y-6 relative group hover:border-white/10 transition-all"
                    >
                      <button
                        (click)="removeQuestion(qIdx)"
                        class="absolute top-6 right-6 text-slate-600 hover:text-indigo-400 transition-colors"
                      >
                        <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div class="flex items-start gap-6">
                        <span class="text-2xl font-black italic text-indigo-500/20 leading-none">{{
                          qIdx + 1
                        }}</span>
                        <div class="flex-1 space-y-4">
                          <input
                            [(ngModel)]="question.text"
                            placeholder="What is the question?"
                            class="w-full bg-transparent border-none outline-none text-white font-bold text-lg placeholder:text-slate-800"
                          />

                          <label class="flex items-center gap-3 cursor-pointer select-none w-fit">
                            <input
                              type="checkbox"
                              [(ngModel)]="question.multipleCorrect"
                              (change)="handleOptionToggle(qIdx, -1)"
                              class="hidden"
                            />
                            <div
                              class="w-10 h-5 bg-slate-800 rounded-full relative transition-colors"
                              [class.bg-indigo-500]="question.multipleCorrect"
                            >
                              <div
                                class="absolute top-1 left-1 size-3 bg-white rounded-full transition-transform"
                                [class.translate-x-5]="question.multipleCorrect"
                              ></div>
                            </div>
                            <span
                              class="text-[9px] font-black uppercase tracking-widest text-slate-500"
                              >Allow Multiple Correct Answers</span
                            >
                          </label>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                        @for (opt of question.options; track $index; let oIdx = $index) {
                          <div
                            class="flex items-center gap-4 p-4 rounded-2xl border transition-all"
                            [class.bg-emerald-500/5]="opt.isCorrect"
                            [class.border-emerald-500/30]="opt.isCorrect"
                            [class.border-white/5]="!opt.isCorrect"
                          >
                            <input
                              [type]="question.multipleCorrect ? 'checkbox' : 'radio'"
                              [name]="'q-' + qIdx"
                              [(ngModel)]="opt.isCorrect"
                              (change)="handleOptionToggle(qIdx, oIdx)"
                              class="size-4 accent-emerald-500 cursor-pointer"
                            />
                            <input
                              [(ngModel)]="opt.text"
                              placeholder="Option text..."
                              class="bg-transparent border-none outline-none text-sm text-slate-300 w-full"
                            />
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <button
                    (click)="addQuestion()"
                    class="w-full py-8 border-2 border-dashed border-white/5 rounded-4xl text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] hover:border-indigo-500/20 hover:text-indigo-400 transition-all bg-white/1"
                  >
                    + Add Question to Quiz
                  </button>
                </div>

                <div
                  class="fixed bottom-0 left-0 w-full lg:static lg:mt-12 bg-linear-to-t from-[#030712] pt-10 pb-6 px-4 z-30"
                >
                  <div class="max-w-4xl mx-auto flex justify-end">
                    <button
                      class="w-full lg:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                      Save Changes
                    </button>
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

  activeView = signal<StudioView>('COURSE_IDENTITY');
  selectedModuleId: string | null = null;

  isSidebarOpen = signal(false);
  isDropdownOpen = signal(false);

  categories = signal<CourseCategoryResponse[]>([]);
  selectedCategoryName = signal<string | null>(null);
  tagInput = '';

  showValidationErrors = false;

  courseId = signal<string | null>(null);

  notification = signal<StudioNotification>({
    message: '',
    type: 'info',
    visible: false,
  });

  courseData = signal({
    title: '',
    slug: '',
    tier: 'FREE' as 'FREE' | 'PREMIUM',
    featured: false,
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
    this.loadCategories();

    const idFromUrl = this.route.snapshot.paramMap.get('id');

    if (idFromUrl) {
      this.enterEditMode(idFromUrl);
    } else {
      this.enterCreateMode();
    }
  }

  enterCreateMode() {
    this.courseId.set(null);

    this.courseData.set({
      title: '',
      slug: '',
      tier: 'FREE',
      featured: false,
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
          this.showToast('Could not find the requested course', 'error');
          this.router.navigate(['/manager/courses']);
        },
      });
  }

  private syncSignals(response: CourseResponse | null) {
    if (!response) {
      this.showToast('Failed to load course data', 'error');
      return;
    }
    this.courseData.set({
      title: response.title,
      slug: response.slug,
      description: response.description,
      tags: [...response.tags],
      featured: response.isFeatured,
      tier: response.accessTier as 'FREE' | 'PREMIUM',
      price: response.price,
      categoryId: response.categoryId,
    });

    // 2. Sync the Modules & Lessons
    // This is the "Magic" that makes the modules appear after refresh
    if (response.modules) {
      // Sort by sequence to ensure "The Leadership Foundation" stays as #1
      const sortedModules = [...response.modules].sort((a, b) => a.sequence - b.sequence);
      this.modules.set(sortedModules);
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

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notification.set({ message, type, visible: true });

    setTimeout(() => {
      this.notification.update((n) => ({ ...n, visible: false }));
    }, 4000);
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
    const moduleId = this.selectedId();
    if (!moduleId || moduleId === 'NEW') return null;

    return this.modules().find((m) => m.id === moduleId) || null;
  }

  isReadyToPublish(): boolean {
    const data = this.courseData();

    const priceValid = data.tier === 'FREE' ? true : data.price !== null && data.price > 0;

    return !!(
      data.title &&
      data.categoryId &&
      data.description &&
      data.description.length >= 20 &&
      data.tags.length > 0 &&
      priceValid
    );
  }

  saveCourse() {
    const data = this.courseData();

    // Validate course identity before creating/updating
    if (!this.isReadyToPublish() && this.activeView() === 'COURSE_IDENTITY') {
      this.showValidationErrors = true;
      this.showToast('Please complete all required fields before continuing.', 'error');
      return;
    }

    if (this.isSaving()) return;

    this.showValidationErrors = false;
    this.isSaving.set(true);

    const request = {
      title: data.title,
      slug: data.slug,
      accessTier: data.tier,
      isFeatured: data.featured,
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
          this.showToast('Draft created successfully! Time to build your modules.', 'success');
          setTimeout(() => {
            this.router.navigate(['/manager/courses/studio', response.id], { replaceUrl: true });
          }, 100); // short delay to allow toast to appear
        } else {
          this.showToast('Your changes have been saved successfully.', 'success');
        }
      },
      error: (err) => {
        const message = err.error?.detail || 'Failed to save course.';
        this.showToast(`${message}`, 'error');
      },
    });
  }

  publishCourse() {
    if (!this.isReadyToPublish()) {
      this.showValidationErrors = true;
      this.showToast('Complete all details before publishing', 'error');
      return;
    }

    this.showToast('Publishing live version...', 'info');
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
    this.selectedId.set(id);
  }

  editingModuleTitle = 'Untitled Module';
  isCreatingNew = false;
  selectedId = signal<string | null>(null);

  // Add this to your component
  selectModule(module: ModuleResponse) {
    this.isCreatingNew = false;
    this.selectedId.set(module.id);

    // THIS IS THE FIX: Push the existing title into the input's variable
    this.editingModuleTitle = module.title;

    this.setView('MODULE_STRUCTURE', module.id);
  }

  addModule() {
    if (!this.courseId()) {
      this.showToast('Please save course info first', 'info');
      return;
    }

    this.isCreatingNew = true;
    this.editingModuleTitle = 'Untitled Module';
    this.selectedId.set('NEW'); // Use a placeholder ID for the view
    this.setView('MODULE_STRUCTURE', 'NEW');
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
          this.selectedId.set(savedModule.id);
          this.isCreatingNew = false;

          this.showToast('Your changes have been saved successfully.', 'success');
        },
        error: (err) => {
          const message = err.error?.detail || 'Failed to save module.';
          this.showToast(`${message}`, 'error');
        },
      });
    } else {
      // Logic for updating existing modules (PUT)
    }
  }

  // Core state for the Step being edited
  editingStepType = signal<'LESSON' | 'QUIZ'>('LESSON');
  editingStepTitle = signal<string>('');
  editingStepContent = signal<string>(''); // The "master" string for the DB
  editingResources = signal<LearningStepResourceRequest[]>([]);
  isCreatingStep = false;
  selectedStepId = signal<string | null>(null);

  // UI-Specific state (only used when type === 'QUIZ')
  quizQuestions = signal<any[]>([]);

  addStep(moduleId: string, type: 'LESSON' | 'QUIZ') {
    this.isCreatingStep = true;
    this.selectedId.set(moduleId); // Parent Module
    this.editingStepType.set(type);

    // Defaults
    this.editingStepTitle.set(type === 'QUIZ' ? 'Untitled Quiz' : 'Untitled Lesson');
    this.editingStepContent.set('');
    this.editingResources.set([]);

    if (type === 'QUIZ') {
      this.quizQuestions.set([]);
      this.addQuestion(); // Start with one blank question
      this.setView('QUIZ_EDITOR', 'NEW');
    } else {
      this.setView('LESSON_EDITOR', 'NEW');
    }
  }

  getSelectedStep() {
    const modules = this.modules();
    const selectedId = this.selectedId();

    if (!modules || !selectedId) return null;

    for (const m of modules) {
      // Use optional chaining (?.) and provide a fallback empty array ([])
      const found = (m.steps || []).find((s) => s.id === selectedId);
      if (found) return found;
    }
    return null;
  }

  selectStep(step: LearningStepResponse) {
    this.isCreatingStep = false;
    this.selectedStepId.set(step.id);

    // Direct assignment - no more searching the modules array!
    this.selectedId.set(step.moduleId);

    // Sync draft variables
    this.editingStepTitle.set(step.title);
    this.editingStepContent.set(step.content || '');
    this.editingStepType.set(step.type as 'LESSON' | 'QUIZ');

    this.setView(step.type === 'QUIZ' ? 'QUIZ_EDITOR' : 'LESSON_EDITOR', step.id);
  }

  addQuestion() {
    const newQuestion = {
      id: crypto.randomUUID(),
      text: '',
      multipleCorrect: false, // Toggle between Radio and Checkbox
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    };
    this.quizQuestions.update((qs) => [...qs, newQuestion]);
  }

  removeQuestion(index: number) {
    this.quizQuestions.update((qs) => qs.filter((_, i) => i !== index));
  }

  // Logic to ensure only one is selected if multipleCorrect is false
  handleOptionToggle(qIdx: number, oIdx: number) {
    this.quizQuestions.update((qs) => {
      const question = qs[qIdx];
      if (!question.multipleCorrect) {
        // Uncheck everything else if it's single choice
        question.options.forEach((opt: any, i: number) => {
          if (i !== oIdx) opt.isCorrect = false;
        });
      }
      return [...qs];
    });
  }

  private calculateDynamicSequence(): number {
    const currentModuleId = this.selectedId();
    const currentStepId = this.selectedStepId(); // 'NEW' or a UUID

    // 1. Find the module this step belongs to
    const parentModule = this.modules().find((m) => m.id === currentModuleId);
    if (!parentModule) return 1;

    // 2. If it's an existing step, find its current sequence
    if (currentStepId !== 'NEW') {
      const existingStep = parentModule.steps?.find((s) => s.id === currentStepId);
      if (existingStep) return existingStep.sequence;
    }

    // 3. If it's a new step, put it at the end (Total steps + 1)
    const stepCount = parentModule.steps?.length || 0;
    return stepCount + 1;
  }

  // State tracking signals
  isUploading = signal<boolean>(false);
  contentTouched = false;

  saveStep() {
    if (this.muxService.isUploading()) {
      this.showToast('Please wait for the video upload to finish', 'info');
      return;
    }

    const request: LearningStepRequest = {
      moduleId: this.selectedId()!,
      title: this.editingStepTitle(),
      type: 'LESSON',
      sequence: this.calculateDynamicSequence(),

      // Toggles
      videoEnabled: this.isVideoLesson(),
      contentEnabled: this.isContentEnabled(),
      materialsEnabled: this.isMaterialsEnabled(),

      // Data
      content: this.isContentEnabled() ? this.editingStepContent() : '',
      videoUploadId: this.isVideoLesson() ? this.mainLessonVideo().uploadId : null,
      resources: this.isMaterialsEnabled() ? this.editingResources() : [],
      questions: [],
    };

    // Validation
    // if (!request.title || !request.content || !request.resources.every((a) => a.file)) {
    //   this.showValidationErrors = true;
    //   this.showToast('Please complete all fields and upload required files.', 'error');
    //   return;
    // }

    this.isSaving.set(true);

    this.learningStepService.createLearningStep(request).subscribe({
      next: (response) => {
        this.showToast('Lesson created successfully', 'success');
        this.isSaving.set(false);
        this.setView('MODULE_STRUCTURE', this.selectedId());
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast('Failed to save lesson', 'error');
      },
    });
  }

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

      // Store it so removeVideo() can find it
      this.currentUploadId.set(uploadId);
      console.log('Successfully captured Mux ID:', uploadId);

      // 2. Upload the bytes
      await this.muxService.uploadToMux(file, uploadUrl);

      this.isUploadComplete.set(true);
      this.isSyncingToCloud.set(false);
    } catch (error) {
      this.isSyncingToCloud.set(false);
      console.error('Upload failed', error);
      this.showToast('Upload failed', 'error');
    }
  }

  isDeleting = signal(false); // Add this signal

  async removeVideo() {
    const uploadId = this.currentUploadId();

    // 1. Protection against double-clicks
    if (this.isDeleting()) return;

    try {
      // 2. Only hit the backend if there's actually a cloud ID
      if (uploadId) {
        this.isDeleting.set(true);
        await firstValueFrom(this.muxService.deleteMuxUpload(uploadId));
        console.log('Cloud cleanup successful.');
      }
    } catch (error) {
      console.error('Cloud cleanup failed, but resetting UI anyway.', error);
    } finally {
      // 3. ALWAYS reset the UI and unlock the button
      // This runs whether there was an uploadId or not
      this.isDeleting.set(false);
      this.selectedVideoFile.set(null);
      this.isUploadComplete.set(false);
      this.isSyncingToCloud.set(false); // Add this to stop any active spinners
      this.currentUploadId.set(null);
      this.mainLessonVideo.update((v) => ({ ...v, file: null, uploadId: null }));
    }
  }

  // A Map where the KEY is the actual Resource object and the VALUE is the loading status
  loadingStates = new Map<LearningStepResourceRequest, boolean>();

  async confirmUpload(resource: LearningStepResourceRequest) {
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
            // Remove the temporary file trigger
            delete (updated as any).tempFile;
            return updated;
          }
          return res;
        }),
      );
    } catch (error) {
      console.error('Material sync failed:', error);
      this.showToast('Upload failed', 'error');
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
      this.showToast('Please confirm or cancel the current upload before adding another', 'info');
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

  async removeAttachment(index: number) {
    const resource = this.editingResources()[index];

    // 1. If it was already uploaded to RustFS, delete it from the cloud
    if (resource?.objectKey) {
      try {
        // Assuming your S3Service has a delete method
        // await firstValueFrom(this.s3Service.deleteFile(resource.objectKey));
        console.log('File deleted from RustFS');
      } catch (error) {
        console.error('Failed to delete file from storage', error);
        // Optional: stop here if you don't want to remove the UI row on failure
      }
    }

    // 2. Remove the row from the UI signal
    this.editingResources.update((prev) => prev.filter((_, i) => i !== index));
  }

  onFileSelected(event: any, attachment: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation Logic
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType || file.size > 500 * 1024 * 1024) {
      this.showToast('Invalid file or file too large (Max 10MB)', 'info');
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
}
