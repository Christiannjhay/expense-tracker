'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { supabase } from '@/lib/supabase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomSelect } from '@/components/ui/CustomSelect';

type Period = {
  id: number;
  name: string;
  type: string;
  year: number;
  month: number;
  total_budget?: number | null;
  start_date?: string | null;
  end_date?: string | null;
};

type Expense = {
  id: number;
  amount: number;
  description: string;
  spent_at: string;
  categories: { name: string } | null;
  category_id: number | null;
};

type Category = {
  id: number;
  name: string;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PeriodPage() {
  const { id } = useParams();
  const router = useRouter(); 
  const [period, setPeriod] = useState<Period | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditPeriodModal, setShowEditPeriodModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [spentAt, setSpentAt] = useState<Date | null>(new Date());
  
  // Edit period states
  const [editPeriodName, setEditPeriodName] = useState('');
  const [editPeriodBudget, setEditPeriodBudget] = useState('');
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editEndDate, setEditEndDate] = useState<Date | null>(null);
  
  // Edit states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Expense | null>(null);
  const [showPeriodDeleteConfirm, setShowPeriodDeleteConfirm] = useState(false);

  // Error states
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [dateError, setDateError] = useState('');
  const [editPeriodError, setEditPeriodError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: periodData, error: periodError } = await supabase
        .from('periods')
        .select('*')
        .eq('id', id)
        .single();

      if (periodError) {
        console.error(periodError.message);
        return;
      }

      setPeriod(periodData);
      setEditPeriodName(periodData.name);
      setEditPeriodBudget(periodData.total_budget?.toString() || '');
      
      // Set start and end dates if trip
      if (periodData.type === 'trip') {
        setEditStartDate(periodData.start_date ? new Date(periodData.start_date) : null);
        setEditEndDate(periodData.end_date ? new Date(periodData.end_date) : null);
      }

      await fetchExpenses();

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoryError) {
        console.error(categoryError.message);
        return;
      }

      setCategories(categoryData || []);
    };

    fetchData();
  }, [id]);

  const fetchExpenses = async () => {
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        description,
        spent_at,
        category_id,
        categories!category_id (
          name
        )
      `)
      .eq('period_id', id)
      .order('spent_at', { ascending: false });

    if (expenseError) {
      console.error(expenseError.message);
      return;
    }

    setExpenses((expenseData || []) as unknown as Expense[]);
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setSpentAt(new Date());
    setEditingExpense(null);
    setAmountError('');
    setDescriptionError('');
    setCategoryError('');
    setDateError('');
  };

  const resetEditPeriodForm = () => {
    setEditPeriodError('');
    if (period) {
      setEditPeriodName(period.name);
      setEditPeriodBudget(period.total_budget?.toString() || '');
      if (period.type === 'trip') {
        setEditStartDate(period.start_date ? new Date(period.start_date) : null);
        setEditEndDate(period.end_date ? new Date(period.end_date) : null);
      }
    }
  };

  const handleUpdatePeriod = async () => {
    if (!period) return;
    
    setEditPeriodError('');
    
    if (!editPeriodName.trim()) {
      setEditPeriodError('Period name is required');
      return;
    }
    
    setLoading(true);

    const updateData: any = {
      name: editPeriodName.trim(),
      total_budget: editPeriodBudget ? parseFloat(editPeriodBudget) : null,
    };

    // If it's a trip, update the date range
    if (period.type === 'trip') {
      if (editStartDate && editEndDate) {
        updateData.start_date = editStartDate.toISOString().split('T')[0];
        updateData.end_date = editEndDate.toISOString().split('T')[0];
      } else {
        setEditPeriodError('Start date and end date are required for trips');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from('periods')
      .update(updateData)
      .eq('id', period.id);

    setLoading(false);

    if (error) {
      console.error(error.message);
      setEditPeriodError('Error updating period: ' + error.message);
      return;
    }

    // Update local period state
    setPeriod({
      ...period,
      ...updateData,
    });
    
    setShowEditPeriodModal(false);
  };

  const handleAddExpense = async () => {
    setAmountError('');
    setDescriptionError('');
    setCategoryError('');
    setDateError('');
    
    let hasError = false;
    
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Amount is required and must be greater than 0');
      hasError = true;
    }
    
    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    }
    
    if (!categoryId) {
      setCategoryError('Please select a category');
      hasError = true;
    }
    
    if (!spentAt) {
      setDateError('Please select a date');
      hasError = true;
    }
    
    if (hasError) return;

    setLoading(true);

    const { error } = await supabase
      .from('expenses')
      .insert({
        period_id: parseInt(id as string),
        amount: parseFloat(amount),
        description: description.trim(),
        category_id: parseInt(categoryId),
        spent_at: spentAt ? spentAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });

    setLoading(false);

    if (error) {
      console.error(error.message);
      alert('Error adding expense: ' + error.message);
      return;
    }

    await fetchExpenses();
    resetForm();
    setShowModal(false);
  };

  const handleEditExpense = async () => {
    if (!editingExpense) return;
    
    setAmountError('');
    setDescriptionError('');
    setCategoryError('');
    setDateError('');
    
    let hasError = false;
    
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Amount is required and must be greater than 0');
      hasError = true;
    }
    
    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    }
    
    if (!categoryId) {
      setCategoryError('Please select a category');
      hasError = true;
    }
    
    if (!spentAt) {
      setDateError('Please select a date');
      hasError = true;
    }
    
    if (hasError) return;

    setLoading(true);

    const { error } = await supabase
      .from('expenses')
      .update({
        amount: parseFloat(amount),
        description: description.trim(),
        category_id: parseInt(categoryId),
        spent_at: spentAt ? spentAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })
      .eq('id', editingExpense.id);

    setLoading(false);

    if (error) {
      console.error(error.message);
      alert('Error updating expense: ' + error.message);
      return;
    }

    await fetchExpenses();
    resetForm();
    setShowModal(false);
  };

  const handleDeleteExpense = async () => {
    if (!showDeleteConfirm) return;

    setLoading(true);

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', showDeleteConfirm.id);

    setLoading(false);

    if (error) {
      console.error(error.message);
      alert('Error deleting expense: ' + error.message);
      return;
    }

    await fetchExpenses();
    setShowDeleteConfirm(null);
  };

  const handleDeletePeriod = async () => {
    if (!period) return;

    setLoading(true);

    // First delete all expenses related to this period
    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .eq('period_id', period.id);

    if (expensesError) {
      console.error(expensesError.message);
      alert('Error deleting expenses: ' + expensesError.message);
      setLoading(false);
      return;
    }

    // Then delete the period
    const { error: periodError } = await supabase
      .from('periods')
      .delete()
      .eq('id', period.id);

    setLoading(false);

    if (periodError) {
      console.error(periodError.message);
      alert('Error deleting period: ' + periodError.message);
      return;
    }

    // Redirect to dashboard after successful deletion
    router.push('/dashboard');
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategoryId(expense.category_id?.toString() || '');
    setSpentAt(new Date(expense.spent_at));
    setShowModal(true);
  };

  const inputClass = "w-full bg-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30";
  const errorInputClass = "w-full bg-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 border-2 border-red-500";
  const labelClass = "text-sm text-white/60 mb-1 block";

  return (
    <div className="p-6 text-white min-h-screen bg-black pb-24">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="text-white/50 hover:text-white transition flex items-center gap-2"
        >
          ← Back
        </button>
        
        {/* Edit and Delete buttons for Period */}
        {period && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetEditPeriodForm();
                setShowEditPeriodModal(true);
              }}
              className="text-white/60 hover:text-white transition p-2"
              title="Edit Period"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setShowPeriodDeleteConfirm(true)}
              className="text-red-400/60 hover:text-red-400 transition p-2"
              title="Delete Period"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {period ? period.name : 'Loading...'}
        </h1>

        {period && period.type === 'trip' && period.start_date && period.end_date && (
          <p className="text-white/60 mt-2">
            {new Date(period.start_date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} - {new Date(period.end_date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        {period && period.type !== 'month' && period.type !== 'trip' && (
          <p className="text-white/60 mt-2">
            {period.type}
          </p>
        )}
      </div>

      <p className="text-white/80 mt-1 font-black uppercase">
        Total spent: ₱{expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString()}
        {period?.total_budget && (
          <span className="text-sm font-normal ml-2">
            / ₱{period.total_budget.toLocaleString()} budget
          </span>
        )}
      </p>

      <div className="mt-6 space-y-3">
        {expenses.length === 0 ? (
          <p className="text-white/40">No expenses yet.</p>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white/10 p-4 rounded-xl group relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{exp.description}</p>
                  <p className="text-sm text-white/50 mt-1">
                    {exp.categories?.name ?? 'Uncategorized'}<br />
                    {new Date(exp.spent_at).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-end gap-2 flex-col">
                  <p className="font-bold text-lg">₱{Number(exp.amount).toLocaleString()}</p>
                  <div className="flex gap-1 ml-2 opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(exp)}
                      className="text-white/60 hover:text-white transition p-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(exp)}
                      className="text-red-400/60 hover:text-red-400 transition p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-white text-black w-14 h-14 rounded-full shadow-lg text-2xl font-bold hover:bg-white/90 transition flex items-center justify-center"
        >
          <span>
            <svg className="z-10 h-6 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12H18M12 6V18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </button>
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => {
            setShowModal(false);
            resetForm();
          }} />
          <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-175 bg-zinc-900 rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => {
                setShowModal(false);
                resetForm();
              }} className="text-white/50 hover:text-white transition">
                ← Back
              </button>
              <h2 className="text-lg font-bold">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
            </div>

            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                placeholder="e.g. 1500.00"
                min="0"
                step="0.01"
                className={amountError ? errorInputClass : inputClass}
              />
              {amountError && (
                <p className="text-red-500 text-sm mt-1">{amountError}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDescriptionError('');
                }}
                placeholder="e.g. Grocery shopping"
                className={descriptionError ? errorInputClass : inputClass}
              />
              {descriptionError && (
                <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <CustomSelect
                value={categoryId}
                onChange={(value) => {
                  setCategoryId(value);
                  setCategoryError('');
                }}
                options={categories}
                placeholder="Select a category"
                className={`w-full ${categoryError ? 'border-2 border-red-500 rounded-lg' : ''}`}
              />
              {categoryError && (
                <p className="text-red-500 text-sm mt-1">{categoryError}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Date Spent</label>
              <DatePicker
                selected={spentAt}
                onChange={(date: Date | null) => {
                  setSpentAt(date);
                  setDateError('');
                }}
                dateFormat="yyyy-MM-dd"
                className={dateError ? errorInputClass : inputClass}
                popperPlacement="top-start"
                placeholderText="Select date"
              />
              {dateError && (
                <p className="text-red-500 text-sm mt-1">{dateError}</p>
              )}
            </div>

            <button
              onClick={editingExpense ? handleEditExpense : handleAddExpense}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </>
      )}

      {/* Edit Period Modal */}
      {showEditPeriodModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => {
            setShowEditPeriodModal(false);
            resetEditPeriodForm();
          }} />
          <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 w-[90%] overflow-visible translate-y-1/2 z-50 mx-auto max-w-md bg-zinc-900 rounded-2xl p-6 space-y-4 max-h-[90vh]">
            <div className='flex flex-col gap-3'>
              <div className="flex items-center gap-3 mb-2 sticky top-0 bg-zinc-900 pt-0 pb-2">
                <button onClick={() => {
                  setShowEditPeriodModal(false);
                  resetEditPeriodForm();
                }} className="text-white/50 hover:text-white transition">
                  ← Back
                </button>
                <h2 className="text-lg font-bold">Edit Period</h2>
              </div>

              <div>
                <label className={labelClass}>Period Name</label>
                <input
                  type="text"
                  value={editPeriodName}
                  onChange={(e) => {
                    setEditPeriodName(e.target.value);
                    setEditPeriodError('');
                  }}
                  placeholder="e.g. January 2025"
                  className={inputClass}
                />
              </div>

              {/* Date Range Pickers for Trips */}
              {period?.type === 'trip' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>Start Date</label>
                    <DatePicker
                      selected={editStartDate}
                      onChange={(date: Date | null) => setEditStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                      className={inputClass}
                      popperPlacement="top-start"
                      placeholderText="Select start date"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>End Date</label>
                    <DatePicker
                      selected={editEndDate}
                      onChange={(date: Date | null) => setEditEndDate(date)}
                      dateFormat="yyyy-MM-dd"
                      className={inputClass}
                      popperPlacement="top-start"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Total Budget (optional)</label>
                <input
                  type="number"
                  value={editPeriodBudget}
                  onChange={(e) => setEditPeriodBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              {editPeriodError && (
                <p className="text-red-500 text-sm">{editPeriodError}</p>
              )}

              <button
                onClick={handleUpdatePeriod}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Period'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Expense Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowDeleteConfirm(null)} />
          <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50 mx-auto max-w-sm bg-zinc-900 rounded-2xl p-6 space-y-4 w-[90%]">
            <h2 className="text-lg font-bold text-center">Delete Expense</h2>
            <p className="text-white/70 text-center">
              Are you sure you want to delete "{showDeleteConfirm.description}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Period Confirmation Modal */}
      {showPeriodDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowPeriodDeleteConfirm(false)} />
          <div className="fixed bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50 mx-auto max-w-sm bg-zinc-900 rounded-2xl p-6 space-y-4 w-[90%]">
            <h2 className="text-lg font-bold text-center">Delete Period</h2>
            <p className="text-white/70 text-center">
              Are you sure you want to delete "{period?.name}"? This will also delete all expenses in this period.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPeriodDeleteConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePeriod}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}