import { useState, useEffect } from 'react'
import { analyticsAPI, transactionsAPI } from '../api/axios'
import Navbar from '../components/Navbar'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const Dashboard = () => {
  const [totals, setTotals] = useState({ income: 0, expenses: 0, net: 0 })
  const [trends, setTrends] = useState([])
  const [budget, setBudget] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [txRes, trendRes, budgetRes] = await Promise.all([
          transactionsAPI.getAll({ limit: 200 }),
          analyticsAPI.getTrends(),
          analyticsAPI.getBudgetVsActual(),
        ])

        // Compute income/expenses/net from signed transaction amounts
        const txs = txRes.data
        const income = txs.reduce((sum, tx) => {
          const amt = parseFloat(tx.amount)
          return sum + (amt > 0 ? amt : 0)
        }, 0)
        const expenses = txs.reduce((sum, tx) => {
          const amt = parseFloat(tx.amount)
          return sum + (amt < 0 ? Math.abs(amt) : 0)
        }, 0)
        setTotals({ income, expenses, net: income - expenses })

        // Add formatted label for XAxis (trends returns {year, month, total_spent})
        setTrends(trendRes.data.map(d => ({
          ...d,
          label: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
        })))

        setBudget(budgetRes.data)
      } catch {
        setError('Failed to load analytics. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const fmt = (n) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading analytics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-gray-500 mb-1">Total Income</p>
                <p className="text-3xl font-bold text-green-600">£{fmt(totals.income)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-red-500">£{fmt(totals.expenses)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <p className="text-sm text-gray-500 mb-1">Net Balance</p>
                <p className={`text-3xl font-bold ${totals.net >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  £{fmt(totals.net)}
                </p>
              </div>
            </div>

            {trends.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="font-semibold text-gray-700 mb-4">Monthly Spending</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => `£${parseFloat(val).toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="total_spent" name="Spending" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {budget.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="font-semibold text-gray-700 mb-4">Budget vs Actual</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={budget}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category_name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => `£${parseFloat(val).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="budget_amount" name="Budget" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="actual_spent" name="Actual" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {trends.length === 0 && budget.length === 0 && !error && (
              <div className="text-center text-gray-400 py-12">
                No analytics data yet. Add some transactions to see charts here.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
