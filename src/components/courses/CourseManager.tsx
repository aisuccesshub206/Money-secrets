import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseSale, CourseStatus } from '../../types';
import { isDateToday, isDateThisWeek, isDateThisMonth } from '../../utils/calculations';
import {
  BookOpen,
  PlusCircle,
  ShoppingBag,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Check,
  Search,
  Filter,
  ArrowRight,
  User,
} from 'lucide-react';

interface CourseManagerProps {
  initialView?: 'catalog' | 'sales';
}

export const CourseManager: React.FC<CourseManagerProps> = ({ initialView = 'catalog' }) => {
  const {
    db,
    overview,
    addCourse,
    editCourse,
    deleteCourse,
    deleteCourseSale,
    setSelectedCourseForSale,
    setEditingCourseSale,
    setIsCourseSaleModalOpen,
    t,
    language,
  } = useApp();

  const sym = db.settings.currencySymbol;
  const isSomali = language === 'so';

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'sales'>(initialView);
  const [sortBy, setSortBy] = useState<'revenue' | 'sales' | 'recent'>('revenue');
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Course Add/Edit modal state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Add course form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('25');
  const [category, setCategory] = useState('Software Development');
  const [status, setStatus] = useState<CourseStatus>('Active');
  const [notes, setNotes] = useState('');
  const [lessonsCount, setLessonsCount] = useState('20');
  const [thumbnail, setThumbnail] = useState('');

  // Enrich each course with accurate real calculations:
  // - Units sold: sum of valid sales' quantities
  // - Revenue received: sum of valid sales' amountReceived
  // - Outstanding amount: sum of valid sales' outstandingAmount
  const enrichedCourses = db.courses.map((course) => {
    const validSales = db.courseSales.filter(
      (s) => s.courseId === course.id && s.paymentStatus !== 'Refunded'
    );
    const unitsSold = validSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
    const revenueReceived = validSales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const outstandingAmount = validSales.reduce((sum, s) => sum + (s.outstandingAmount || 0), 0);

    const revToday = validSales
      .filter((s) => isDateToday(s.date))
      .reduce((sum, s) => sum + (s.amountReceived || 0), 0);

    const revThisWeek = validSales
      .filter((s) => isDateThisWeek(s.date))
      .reduce((sum, s) => sum + (s.amountReceived || 0), 0);

    const revThisMonth = validSales
      .filter((s) => isDateThisMonth(s.date))
      .reduce((sum, s) => sum + (s.amountReceived || 0), 0);

    return {
      ...course,
      unitsSold,
      revenueReceived,
      outstandingAmount,
      revToday,
      revThisWeek,
      revThisMonth,
    };
  });

  // Sort courses
  const sortedCourses = [...enrichedCourses].sort((a, b) => {
    if (sortBy === 'sales') return b.unitsSold - a.unitsSold;
    if (sortBy === 'revenue') return b.revenueReceived - a.revenueReceived;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter sales
  const filteredSales = db.courseSales.filter((sale) => {
    const matchesCourse = selectedCourseFilter === 'all' || sale.courseId === selectedCourseFilter;
    const matchesSearch =
      !salesSearch ||
      sale.courseName.toLowerCase().includes(salesSearch.toLowerCase()) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(salesSearch.toLowerCase())) ||
      (sale.customerWhatsapp && sale.customerWhatsapp.includes(salesSearch)) ||
      (sale.notes && sale.notes.toLowerCase().includes(salesSearch.toLowerCase()));
    return matchesCourse && matchesSearch;
  });

  // Open add course modal
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setName('');
    setDescription('');
    setPrice('25');
    setCategory('Software Development');
    setStatus('Active');
    setNotes('');
    setLessonsCount('20');
    setThumbnail('');
    setIsAddCourseModalOpen(true);
  };

  // Open edit course modal
  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setDescription(course.description);
    setPrice(course.price.toString());
    setCategory(course.category);
    setStatus(course.status);
    setNotes(course.notes || '');
    setLessonsCount(course.lessonsCount ? course.lessonsCount.toString() : '20');
    setThumbnail(course.thumbnail || '');
    setIsAddCourseModalOpen(true);
  };

  // Save course (creating a course NEVER increases revenue or adds sales)
  const handleSubmitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price) || 0;
    const parsedLessons = parseInt(lessonsCount, 10) || 0;

    if (editingCourse) {
      editCourse(editingCourse.id, {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        status,
        notes: notes.trim() || undefined,
        lessonsCount: parsedLessons,
        thumbnail: thumbnail.trim() || undefined,
      });
    } else {
      addCourse({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        status,
        notes: notes.trim() || undefined,
        lessonsCount: parsedLessons,
        thumbnail: thumbnail.trim() || undefined,
      });
    }
    setIsAddCourseModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Header with 2 prominent action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            {isSomali ? 'Maamulka Koorsooyinka & Iibka' : 'Course & Sales Management'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isSomali
              ? 'Xakamee koorsooyinkaaga, qiimaha, iyo diiwaanka iibka rasmiga ah ee XirfadoNet.'
              : 'Owner control center for catalog courses, pricing, and explicitly recorded sales.'}
          </p>
        </div>

        {/* 2 Clear Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* + Add Course */}
          <button
            onClick={handleOpenAddCourse}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isSomali ? '+ Ku dar Koorsada' : '+ Add Course'}</span>
          </button>

          {/* + Record Course Sale */}
          <button
            onClick={() => {
              setSelectedCourseForSale(null);
              setEditingCourseSale(null);
              setIsCourseSaleModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isSomali ? '+ Diiwaangeli Iibka' : '+ Record Course Sale'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Bar: Units Sold, Revenue Received, Outstanding Amount */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Tirada Koorsooyinka' : 'Total Courses'}
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-white">
            {db.courses.length}
          </p>
          <p className="text-[10px] text-slate-500">
            {db.courses.filter(c => c.status === 'Active').length} {isSomali ? 'firfircoon' : 'active'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Tirada la Iibiyey' : 'Units Sold'}
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-cyan-400">
            {overview.totalCourseUnitsSold}
          </p>
          <p className="text-[10px] text-slate-500">
            {db.courseSales.length} {isSomali ? 'macaamil diiwaangashan' : 'sales recorded'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Dakhliga la Helay' : 'Revenue Received'}
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-400">
            {sym}{overview.totalCourseRevenueReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500">
            {isSomali ? 'Waxa lagu daray hadhaaga' : 'Added to available balance'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Lacagta Dhiman' : 'Outstanding Amount'}
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-amber-400">
            {sym}{overview.totalCourseOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500">
            {isSomali ? 'Qaybaha weli dhiman' : 'Pending student balances'}
          </p>
        </div>
      </div>

      {/* 3. Section Switcher Tabs: Courses Catalog vs Course Sales Records */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'catalog'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{isSomali ? 'Koorsooyinka' : 'Courses Catalog'} ({db.courses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sales')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeSubTab === 'sales'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{isSomali ? 'Diiwaanka Iibka' : 'Course Sales Records'} ({db.courseSales.length})</span>
        </button>
      </div>

      {/* 4. SUBTAB A: COURSES CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Sorting controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {isSomali ? 'Kala hormari:' : 'Sort by:'}
              </span>
              <button
                onClick={() => setSortBy('revenue')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  sortBy === 'revenue'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? 'Dakhliga ugu sarreeya' : 'Highest Revenue'}
              </button>
              <button
                onClick={() => setSortBy('sales')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  sortBy === 'sales'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? 'Tirada ugu badan' : 'Most Sold'}
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  sortBy === 'recent'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? 'Kuwii dambeeyey' : 'Recently Added'}
              </button>
            </div>
          </div>

          {/* Clean empty state if no courses exist */}
          {sortedCourses.length === 0 ? (
            <div className="py-14 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-8 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                {isSomali ? 'Weli koorsooyin lama abuurin.' : 'No courses created yet.'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isSomali
                  ? 'Abuur koorsadaadii ugu horraysay si aad u dejiso qiimaha oo aad u bilowdo la socodka iibka.'
                  : 'Add your first course to set the price and start tracking student enrollments and sales.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleOpenAddCourse}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{isSomali ? '+ Ku dar Koorsada' : '+ Add Course'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Header bar with status and price */}
                    <div className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                          {course.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            course.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : course.status === 'Draft'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">
                        {course.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-xs text-slate-400">Unit Price:</span>
                        <span className="font-mono text-lg font-extrabold text-white">
                          {sym}{course.price}
                        </span>
                      </div>

                      {/* Course Performance Metrics */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2.5 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">
                            {isSomali ? 'La Iibiyey' : 'Units Sold'}
                          </p>
                          <p className="font-mono text-base font-bold text-white mt-0.5">
                            {course.unitsSold}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-400 uppercase font-semibold">
                            {isSomali ? 'La Helay' : 'Revenue'}
                          </p>
                          <p className="font-mono text-base font-bold text-emerald-400 mt-0.5">
                            {sym}{course.revenueReceived.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-400 uppercase font-semibold">
                            {isSomali ? 'Dhiman' : 'Pending'}
                          </p>
                          <p className="font-mono text-base font-bold text-amber-400 mt-0.5">
                            {sym}{course.outstandingAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {course.notes && (
                        <p className="mt-2.5 text-[11px] text-slate-500 italic">
                          "{course.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Course Action Buttons */}
                  <div className="flex items-center justify-between border-t border-slate-800 p-3 sm:px-5 bg-slate-950/40">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title={isSomali ? 'Wax ka beddel' : 'Edit course'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete course "${course.name}"?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title={isSomali ? 'Tirtir' : 'Delete course'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Instant Record Sale button for this course */}
                    <button
                      onClick={() => {
                        setSelectedCourseForSale(course);
                        setEditingCourseSale(null);
                        setIsCourseSaleModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-500 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{isSomali ? 'Diiwaangeli Iib' : 'Record Sale'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SUBTAB B: COURSE SALES RECORDS */}
      {activeSubTab === 'sales' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder={isSomali ? 'Raadi macmiil, koorso, WhatsApp...' : 'Search student, course, WhatsApp, notes...'}
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">{isSomali ? 'Dhammaan Koorsooyinka' : 'All Courses'}</option>
                {db.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSelectedCourseForSale(null);
                  setEditingCourseSale(null);
                  setIsCourseSaleModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{isSomali ? '+ Iib Cusub' : '+ New Sale'}</span>
              </button>
            </div>
          </div>

          {/* Sales Table */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 overflow-x-auto">
            {filteredSales.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 space-y-2.5">
                <p className="text-sm font-bold text-white">
                  {isSomali ? 'Weli ma jiro iib koorso oo la diiwaangeliyey.' : 'No course sales recorded yet.'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isSomali
                    ? 'Diiwaangeli iibka ardayda si aad u aragto dakhliga koorsooyinka iyo xogta macaamiisha.'
                    : 'Record student purchases to track your course revenue and customer directory.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedCourseForSale(null);
                      setEditingCourseSale(null);
                      setIsCourseSaleModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isSomali ? '+ Diiwaangeli Iibka Koorsada' : '+ Record Course Sale'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-2">{isSomali ? 'Taariikhda' : 'Date'}</th>
                    <th className="pb-3">{isSomali ? 'Koorsada' : 'Course'}</th>
                    <th className="pb-3">{isSomali ? 'Macmiilka' : 'Student / Customer'}</th>
                    <th className="pb-3 text-center">{isSomali ? 'Tirada' : 'Qty'}</th>
                    <th className="pb-3 text-right">{isSomali ? 'Qiimaha' : 'Price'}</th>
                    <th className="pb-3 text-right">{isSomali ? 'La Helay' : 'Received'}</th>
                    <th className="pb-3 text-right">{isSomali ? 'Dhiman' : 'Outstanding'}</th>
                    <th className="pb-3">{isSomali ? 'Habka' : 'Method'}</th>
                    <th className="pb-3">{isSomali ? 'Xaaladda' : 'Status'}</th>
                    <th className="pb-3 text-right pr-2">{isSomali ? 'Hawl' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-2 font-mono text-slate-400">{sale.date}</td>
                      <td className="py-3">
                        <p className="font-bold text-white">{sale.courseName}</p>
                        {sale.notes && (
                          <p className="text-[10px] text-slate-500 italic">{sale.notes}</p>
                        )}
                      </td>
                      <td className="py-3">
                        <p className="text-slate-200">{sale.customerName || '—'}</p>
                        {sale.customerWhatsapp && (
                          <p className="font-mono text-[10px] text-slate-500">{sale.customerWhatsapp}</p>
                        )}
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-white">
                        {sale.quantity || 1}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {sym}{sale.salePrice}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        +{sym}{sale.amountReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-amber-400">
                        {sale.outstandingAmount > 0 ? `${sym}${sale.outstandingAmount}` : '—'}
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            sale.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : sale.paymentStatus === 'Partial'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCourseSale(sale);
                              setSelectedCourseForSale(null);
                              setIsCourseSaleModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title={isSomali ? 'Wax ka beddel' : 'Edit sale'}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(isSomali ? 'Ma hubtaa inaad tirtirto iibkan?' : 'Delete this course sale?')) {
                                deleteCourseSale(sale.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title={isSomali ? 'Tirtir' : 'Delete sale'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT COURSE MODAL */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsAddCourseModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingCourse
                      ? (isSomali ? 'Wax ka beddel Koorsada' : 'Edit Course')
                      : (isSomali ? 'Abuur Koorso Cusub' : 'Create New Course')}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isSomali
                      ? 'Abuurista koorsadu wax dakhli ah kuma kordhiso ilaa aad iib diiwaangeliso'
                      : 'Creating a course sets pricing; does not increase revenue until sales are recorded'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="space-y-3.5">
              {/* Course Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Magaca Koorsada *' : 'Course Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isSomali ? 'Tusaale: Video Editing Masterclass' : 'e.g. Video Editing or Full-Stack AI'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Faahfaahinta Koorsada *' : 'Description *'}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={isSomali ? 'Faahfaahin kooban oo ku saabsan waxa lagu baranayo...' : 'Brief summary of what students will achieve...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isSomali ? `Qiimaha (${sym}) *` : `Price (${sym}) *`}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 font-mono">
                      {sym}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-7 pr-3 text-xs font-mono font-bold text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isSomali ? 'Qaybta (Category) *' : 'Category *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Media, Coding, Business"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status & Lessons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isSomali ? 'Xaaladda *' : 'Status *'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CourseStatus)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Active">Active (Firfircoon)</option>
                    <option value="Draft">Draft (Qabyo)</option>
                    <option value="Inactive">Inactive (Aan firfircoonayn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isSomali ? 'Tirada Casharrada' : 'Lessons Count'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lessonsCount}
                    onChange={(e) => setLessonsCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSomali ? 'Qoraal Gaar ah (Notes)' : 'Internal Notes (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isSomali ? 'Qoraal gaar kuu ah oo ku saabsan koorsadan...' : 'Private internal owner notes...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:scale-[0.98] transition-all"
                >
                  {editingCourse
                    ? (isSomali ? 'Kaydi Isbeddelka' : 'Save Course Changes')
                    : (isSomali ? '+ Abuur Koorsada' : '+ Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
