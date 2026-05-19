import { useState, useEffect } from 'react'
import { transactionsAPI, accountsAPI } from '../api/axios'
import Navbar from '../components/Navbar'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    account_id: '',
    amount: '',
    transaction_type: 'expense',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  })

  const fetchData = async () => {
    try {
      const [txRes, accRes] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
      ])
      setTransactions(txRes.data)
      setAccounts(accRes.data)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const raw = parseFloat(form.amount)
      // Backend uses signed amounts: positive = income, negative = expense
      const signedAmount = form.transaction_type === 'income' ? Math.abs(raw) : -Math.abs(raw)
      await transactionsAPI.create({
        account_id: parseInt(form.account_id),
        amount: signedAmount,
        description: form.description || null,
        transaction_date: form.transaction_date,
      })
      setShowForm(false)
      setForm({ account_id: '', amount: '', transaction_type: 'expense', description: '', transaction_date: new Date().toISOString().split('T')[0] })
      fetchData()
    } catch {
      setError('Failed to create transaction')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await transactionsAPI.delete(id)
      fetchData()
    } catch {
      setError('Failed to delete transaction')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            {showForm ? 'Cancel' : '+ New Transaction'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700">New Transaction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select
                value={form.transaction_type}
                onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="expense">Expense (−)</option>
                <option value="income">Income (+)</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min="0.01"
                step="0.01"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        )}

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No transactions yet.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const txType = parseFloat(tx.amount) >= 0 ? 'income' : 'expense'
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{tx.transaction_date}</td>
                      <td className="px-6 py-4 text-gray-800">{tx.description || '—'}</td>
                      <td className="px-6 py-4 text-gray-500">{tx.category_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          txType === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {txType}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${
                        txType === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        £{Math.abs(parseFloat(tx.amount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions
