import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api/axios'
import Navbar from '../components/Navbar'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [budget, setBudget] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, trendRes, budgetRes] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getTrends(),
          analyticsAPI.getBudgetVsActual(),
        ])
        setSummary(sumRes.data)
        setTrends(trendRes.data)
        setBudget(budgetRes.data)
      } catch {
        setError('Failed to load analytics. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

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
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    £{parseFloat(summary.total_income || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-500">
                    £{parseFloat(summary.total_expenses || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow p-6">
                  <p className="text-sm text-gray-500 mb-1">Net Balance</p>
                  <p className={`text-3xl font-bold ${(summary.net_balance || 0) >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    £{parseFloat(summary.net_balance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            {trends.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="font-semibold text-gray-700 mb-4">Monthly Trends</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => `£${parseFloat(val).toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
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
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => `£${parseFloat(val).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="actual" fill="#f59e0b" radius={[4,4,0,0]} />
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
