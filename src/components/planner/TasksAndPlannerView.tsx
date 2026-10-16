import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WebsiteTask,
  ContentTask,
  DailyTask,
  PriorityLevel,
  ContentStage,
  ContentType,
} from '../../types';
import { getTodayDateString } from '../../utils/storage';
import {
  CheckSquare,
  Globe,
  Film,
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  Repeat,
} from 'lucide-react';

interface TasksAndPlannerProps {
  initialTab?: 'daily' | 'content' | 'website';
}

export const TasksAndPlannerView: React.FC<TasksAndPlannerProps> = ({ initialTab = 'daily' }) => {
  const {
    db,
    addWebsiteTask,
    editWebsiteTask,
    deleteWebsiteTask,
    addContentTask,
    editContentTask,
    deleteContentTask,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'content' | 'website'>(initialTab);

  // Daily task form
  const [dailyTitle, setDailyTitle] = useState('');
  const [dailyPriority, setDailyPriority] = useState<PriorityLevel>('High');
  const [dailyImportant, setDailyImportant] = useState(false);
  const [dailyRecurring, setDailyRecurring] = useState(false);

  // Content task form
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Course Lesson');
  const [contentStage, setContentStage] = useState<ContentStage>('Idea');
  const [contentCourseId, setContentCourseId] = useState('');

  // Website task form
  const [isAddWebOpen, setIsAddWebOpen] = useState(false);
  const [webTitle, setWebTitle] = useState('');
  const [webPriority, setWebPriority] = useState<PriorityLevel>('Medium');
  const [webDueDate, setWebDueDate] = useState('');

  const today = getTodayDateString();

  // Daily metrics
  const todayTasks = db.dailyTasks.filter(t => t.dueDate === today);
  const completedToday = todayTasks.filter(t => t.isCompleted);
  const remainingToday = todayTasks.filter(t => !t.isCompleted);
  const importantToday = todayTasks.filter(t => t.isImportant && !t.isCompleted);

  const handleAddDaily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyTitle.trim()) return;

    addDailyTask({
      title: dailyTitle.trim(),
      dueDate: today,
      priority: dailyPriority,
      isImportant: dailyImportant,
      isCompleted: false,
      isRecurring: dailyRecurring,
    });

    setDailyTitle('');
  };

  const stages: ContentStage[] = ['Idea', 'Writing', 'Recording', 'Editing', 'Ready', 'Published'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-400" />
            Execution: Daily Planner & Content Hub
          </h1>
          <p className="text-xs text-slate-400">
            Keep courses progressing, website tasks moving, and manage high-priority daily work items.
          </p>
        </div>

        {/* Sub tab navigation */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'daily'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 Daily Planner
          </button>
          <button
            onClick={() => setActiveSubTab('content')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'content'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎬 Content Pipeline
          </button>
          <button
            onClick={() => setActiveSubTab('website')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'website'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Website Tasks
          </button>
        </div>
      </div>

      {/* 1. DAILY WORK PLANNER */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {/* Today Overview Header Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <p className="text-[10px] font-bold uppercase text-slate-500">Today's Tasks</p>
              <p className="font-mono text-2xl font-black text-white mt-1">{todayTasks.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <p className="text-[10px] font-bold uppercase text-rose-400">Important / Urgent</p>
              <p className="font-mono text-2xl font-black text-rose-300 mt-1">{importantToday.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <p className="text-[10px] font-bold uppercase text-emerald-400">Completed</p>
              <p className="font-mono text-2xl font-black text-emerald-300 mt-1">{completedToday.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
              <p className="text-[10px] font-bold uppercase text-amber-400">Remaining</p>
              <p className="font-mono text-2xl font-black text-amber-300 mt-1">{remainingToday.length}</p>
            </div>
          </div>

          {/* Quick Add Daily Task Input */}
          <form onSubmit={handleAddDaily} className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2">
            <input
              type="text"
              required
              placeholder="What needs to get done today? (e.g. Record lesson 5, confirm EVC transfer)"
              value={dailyTitle}
              onChange={(e) => setDailyTitle(e.target.value)}
              className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <select
              value={dailyPriority}
              onChange={(e) => setDailyPriority(e.target.value as PriorityLevel)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              type="button"
              onClick={() => setDailyImportant(!dailyImportant)}
              className={`rounded-lg px-2 py-1 text-xs font-semibold border ${
                dailyImportant ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              ★ Important
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Add Task
            </button>
          </form>

          {/* Today Tasks Checklist */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 divide-y divide-slate-800/80">
            {todayTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No tasks logged for today yet.</p>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDailyTask(t.id)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {t.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${t.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className={`font-semibold ${
                          t.priority === 'Urgent' ? 'text-rose-400' : t.priority === 'High' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                        {t.isImportant && <span className="text-rose-400">★ Important</span>}
                        {t.isRecurring && <span className="flex items-center gap-0.5 text-cyan-400"><Repeat className="h-2.5 w-2.5" /> Recurring</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDailyTask(t.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. CONTENT / LESSON PLANNER (Idea -> Writing -> Recording -> Editing -> Ready -> Published) */}
      {activeSubTab === 'content' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Content Pipeline: Move lessons and promotional social videos from Idea to Published.
            </p>
            <button
              onClick={() => setIsAddContentOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Add Content Item</span>
            </button>
          </div>

          {/* Kanban Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stages.map((stage) => {
              const items = db.contentTasks.filter(c => c.stage === stage);

              return (
                <div key={stage} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <h3 className="text-xs font-bold text-white uppercase">{stage}</h3>
                      <span className="font-mono text-[10px] text-slate-400">{items.length}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs space-y-1.5">
                          <span className="rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1 py-0.2">
                            {item.contentType}
                          </span>
                          <p className="font-bold text-white text-xs">{item.title}</p>
                          {item.courseName && (
                            <p className="text-[10px] text-slate-400">{item.courseName}</p>
                          )}
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                            <button
                              onClick={() => deleteContentTask(item.id)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {/* Advance stage button */}
                            {stage !== 'Published' && (
                              <button
                                onClick={() => {
                                  const nextIdx = stages.indexOf(stage) + 1;
                                  if (nextIdx < stages.length) {
                                    editContentTask(item.id, { stage: stages[nextIdx] });
                                  }
                                }}
                                className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 hover:underline"
                              >
                                <span>Advance</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WEBSITE TASKS */}
      {activeSubTab === 'website' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Manage website enhancements, bug fixes, payment buttons, and SEO updates.
            </p>
            <button
              onClick={() => setIsAddWebOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Add Website Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['To Do', 'In Progress', 'Completed'] as const).map((status) => {
              const tasks = db.websiteTasks.filter(t => t.status === status);

              return (
                <div key={status} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 min-h-[350px]">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
                    <h3 className="text-xs font-bold text-white uppercase">{status}</h3>
                    <span className="font-mono text-xs text-slate-400">{tasks.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.map((task) => (
                      <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold text-white">{task.title}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && <p className="text-slate-400 text-[11px]">{task.description}</p>}

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                          <button
                            onClick={() => deleteWebsiteTask(task.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <select
                            value={task.status}
                            onChange={(e) => editWebsiteTask(task.id, { status: e.target.value as any })}
                            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {isAddContentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80" onClick={() => setIsAddContentOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-sm font-bold text-white mb-3">Add Content Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addContentTask({
                title: contentTitle,
                contentType,
                stage: contentStage,
                courseId: contentCourseId || undefined,
              });
              setIsAddContentOpen(false);
              setContentTitle('');
            }} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Title (e.g. Lesson 4: AI Multimodal Coding)"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
              />
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
              >
                <option value="Course Lesson">Course Lesson</option>
                <option value="YouTube Video">YouTube Video</option>
                <option value="TikTok">TikTok / Reel</option>
                <option value="Article">Article</option>
                <option value="AI Tutorial">AI Tutorial</option>
              </select>
              <button type="submit" className="w-full rounded-xl bg-emerald-500 py-2.5 font-bold text-slate-950">
                Save Content Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Website Task Modal */}
      {isAddWebOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80" onClick={() => setIsAddWebOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-sm font-bold text-white mb-3">Add Website Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addWebsiteTask({
                title: webTitle,
                priority: webPriority,
                status: 'To Do',
              });
              setIsAddWebOpen(false);
              setWebTitle('');
            }} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Task title (e.g. Integrate Waafi automated webhook)"
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
              />
              <select
                value={webPriority}
                onChange={(e) => setWebPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button type="submit" className="w-full rounded-xl bg-cyan-500 py-2.5 font-bold text-slate-950">
                Save Website Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
