import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Users, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingState from '@/components/LoadingState';

function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalContacts: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [leadsSnapshot, contactsSnapshot, opportunitiesSnapshot] = await Promise.all([
        getDocs(collection(db, 'leads')),
        getDocs(collection(db, 'contacts')),
        getDocs(collection(db, 'opportunities'))
      ]);

      const totalRevenue = opportunitiesSnapshot.docs.reduce((acc, doc) => {
        return acc + (doc.data().amount || 0);
      }, 0);

      setStats({
        totalLeads: leadsSnapshot.size,
        totalContacts: contactsSnapshot.size,
        totalOpportunities: opportunitiesSnapshot.size,
        totalRevenue,
        recentActivities: []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingState container className="h-32" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      change: '+12%',
      positive: true,
      color: 'blue'
    },
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: Users,
      change: '+5%',
      positive: true,
      color: 'green'
    },
    {
      title: 'Opportunities',
      value: stats.totalOpportunities,
      icon: TrendingUp,
      change: '-3%',
      positive: false,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+8%',
      positive: true,
      color: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">
            Add Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${card.color}-50`}>
                  <Icon className={`h-6 w-6 text-${card.color}-500`} />
                </div>
                <div className="flex items-center space-x-1">
                  {card.positive ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${card.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Chart coming soon...
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900">Lead Sources</h3>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Chart coming soon...
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No recent activities
            </div>
          ) : (
            stats.recentActivities.map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                {/* Activity content would go here */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;