import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { LayoutDashboard, TrendingUp, Package, Wallet, Megaphone, Lightbulb, LogOut, Calendar, User, Bot, Truck, AlertCircle, PieChart, Activity, Share2, Book, Brain } from 'lucide-react';

// Lazy load heavy components
const InventoryView = lazy(() => import('../components/InventoryView'));
const FinanceView = lazy(() => import('../components/FinanceView'));
const MarketingView = lazy(() => import('../components/MarketingView'));
const ProfileView = lazy(() => import('../components/ProfileView'));
const PolicyExpert = lazy(() => import('../components/PolicyExpert'));
const SupplierDiscovery = lazy(() => import('../components/SupplierDiscovery'));
const NetworkView = lazy(() => import('../components/NetworkView'));
const GrowthHub = lazy(() => import('../components/GrowthHub'));
const LedgerView = lazy(() => import('../components/LedgerView'));
const DemandForecastingView = lazy(() => import('../components/DemandForecastingView'));

// Keep lightweight components as regular imports
import AdvisorWidget from '../components/AdvisorWidget';
import '../features.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [timeframe, setTimeframe] = useState('monthly');
    const [error, setError] = useState(null);
    const userName = localStorage.getItem('userName') || 'User';
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            console.warn("No userId found in localStorage, redirecting to login.");
            navigate('/');
            return;
        }

        const fetchSummary = async () => {
            try {
                console.log('[Dashboard] Fetching summary for userId:', userId);

                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const res = await fetch(`http://127.0.0.1:5000/api/dashboard/summary/${userId}`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!res.ok) {
                    throw new Error(`HTTP Error! Status: ${res.status}`);
                }

                const data = await res.json();
                console.log('[Dashboard] Summary loaded successfully');
                setSummary(data);
            } catch (err) {
                console.error("Summary Fetch Error:", err);
                if (err.name === 'AbortError') {
                    setError(`Request timeout. Server might be slow or down.`);
                } else {
                    setError(`Failed to load dashboard data: ${err.message}`);
                }
            }
        };

        fetchSummary();
    }, [userId, navigate]); // Removed activeTab to prevent re-fetch on tab change

    useEffect(() => {
        if (!userId || !summary) return;

        const fetchChart = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/dashboard/sales-chart/${userId}?timeframe=${timeframe}`);
                if (!res.ok) return;
                const data = await res.json();
                setChartData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: `Income`,
                            data: data.incomeData,
                            backgroundColor: 'rgba(34, 197, 94, 0.6)',
                            borderColor: 'rgb(34, 197, 94)',
                            tension: 0.3
                        },
                        {
                            label: `Expenses`,
                            data: data.expenseData,
                            backgroundColor: 'rgba(239, 68, 68, 0.6)',
                            borderColor: 'rgb(239, 68, 68)',
                            tension: 0.3
                        },
                        {
                            label: `Net Profit`,
                            data: data.profitData,
                            backgroundColor: 'rgba(59, 130, 246, 0.6)',
                            borderColor: 'rgb(59, 130, 246)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                });
            } catch (err) {
                console.error("Chart Fetch Error:", err);
            }
        };

        fetchChart();
    }, [userId, timeframe, summary]);

    if (error) {
        return (
            <div className="error-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={{ marginTop: '1rem' }}>Dashboard Error</h2>
                <p style={{ color: '#64748b', maxWidth: '500px', textAlign: 'center', margin: '1rem' }}>{error}</p>
                <button onClick={() => window.location.reload()} className="primary-btn" style={{ width: 'auto', padding: '10px 20px', marginTop: '1rem' }}>Retry</button>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="loading" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p>Loading Dashboard Intelligence...</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Fetching data for user: {userId?.substring(0, 8)}...
                </p>
            </div>
        );
    }

    const renderContent = () => {
        const LoadingFallback = () => (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Loading module...
            </div>
        );

        const content = (() => {
            switch (activeTab) {
                case 'inventory': return <InventoryView />;
                case 'finance': return <FinanceView />;
                case 'marketing': return <MarketingView />;
                case 'demand-forecast': return <DemandForecastingView />;
                case 'policy': return <PolicyExpert />;
                case 'marketplace': return <SupplierDiscovery />;
                case 'network': return <NetworkView />;
                case 'growth': return <GrowthHub />;
                case 'ledger': return <LedgerView />;
                case 'profile': return <ProfileView />;
                default:
                    return (
                        <>
                            <header>
                                <h1>Welcome back, {userName}</h1>
                                <p>Strategic Insights for {localStorage.getItem('businessName') || 'your business'}.</p>
                            </header>

                            <section className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Total Revenue</h3>
                                    <p className="value" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>₹{summary.monthlySales || 0}</p>
                                    <small style={{ color: '#10b981', fontWeight: '600' }}>Cash & UPI Collections</small>
                                </div>
                                <div className="card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Inventory Cost (COGS)</h3>
                                    <p className="value" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#f59e0b' }}>₹{summary.monthlyCOGS || 0}</p>
                                    <small style={{ color: '#64748b' }}>Stock Purchase Value</small>
                                </div>
                                <div className="card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>OpEx (Rent/Salary)</h3>
                                    <p className="value" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#ef4444' }}>₹{summary.operatingExpenses || 0}</p>
                                    <small style={{ color: '#64748b' }}>Operations & Overheads</small>
                                </div>
                                <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', border: 'none', borderRadius: '16px', padding: '1.5rem', color: 'white' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>Net Profit</h3>
                                    <p className="value" style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>₹{summary.profit || 0}</p>
                                    <small style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Actual Disposable Income</small>
                                </div>
                            </section>

                            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} color="#6366f1" /> P&L Trend</h3>
                                        <div className="time-toggles">
                                            <button className={timeframe === 'daily' ? 'active' : ''} onClick={() => setTimeframe('daily')}>Day</button>
                                            <button className={timeframe === 'weekly' ? 'active' : ''} onClick={() => setTimeframe('weekly')}>Week</button>
                                            <button className={timeframe === 'monthly' ? 'active' : ''} onClick={() => setTimeframe('monthly')}>Month</button>
                                        </div>
                                    </div>
                                    {chartData ? <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} /> : <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No activity data for this period</div>}
                                </div>

                                <AdvisorWidget metrics={summary} />
                            </div>

                            <div className="secondary-analytics" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
                                <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><PieChart size={20} color="#6366f1" /> Expense Mix</h3>
                                    {summary.expenseBreakdown && summary.expenseBreakdown.length > 0 ? (
                                        <Pie data={{
                                            labels: summary.expenseBreakdown.map(d => d.name),
                                            datasets: [{
                                                data: summary.expenseBreakdown.map(d => d.value),
                                                backgroundColor: [
                                                    '#6366f1', // Indigo
                                                    '#10b981', // Emerald
                                                    '#f59e0b', // Amber
                                                    '#ef4444', // Red
                                                    '#ec4899', // Pink
                                                    '#8b5cf6', // Violet
                                                    '#14b8a6', // Teal
                                                    '#f97316', // Orange
                                                    '#06b6d4', // Cyan
                                                    '#84cc16', // Lime
                                                    '#d946ef', // Fuchsia
                                                    '#3b82f6', // Blue
                                                    '#eab308', // Yellow
                                                    '#64748b', // Slate
                                                    '#a855f7', // Purple
                                                ]
                                            }]
                                        }} />
                                    ) : <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No expense data for breakdown</div>}
                                </div>

                                <div className="quick-actions-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h3>Pulse Check</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', fontWeight: '700' }}>SALES HEALTH</p>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#166534' }}>Stable</div>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#166534' }}>+5% growth expected</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#991b1b', fontWeight: '700' }}>STOCK RISK</p>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#991b1b' }}>{summary.lowStockCount > 5 ? 'High' : 'Low'}</div>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#991b1b' }}>{summary.lowStockCount} items need attention</p>
                                        </div>
                                    </div>
                                    <button className="secondary-btn" onClick={() => setActiveTab('inventory')} style={{ marginTop: '1.5rem' }}>View Full Inventory Report</button>
                                </div>
                            </div>
                        </>
                    );
            }
        })();

        // Wrap lazy-loaded components in Suspense
        if (activeTab !== 'dashboard') {
            return <Suspense fallback={<LoadingFallback />}>{content}</Suspense>;
        }
        return content;
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
            <aside className="sidebar" style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '1.5rem', flexShrink: 0 }}>
                <div className="brand" style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp /> MSME Engine</h2>
                </div>
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[
                        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                        { id: 'inventory', label: 'Inventory', icon: Package },
                        { id: 'finance', label: 'Finance', icon: Wallet },
                        { id: 'marketing', label: 'AI Marketing', icon: Megaphone },
                        { id: 'demand-forecast', label: 'Demand Forecast', icon: Brain, color: '#8b5cf6' },
                        { id: 'ledger', label: 'Digital Ledger', icon: Book },
                        { id: 'growth', label: 'Growth Intelligence', icon: Lightbulb, color: '#10b981' },
                        { id: 'network', label: 'Network Simulation', icon: Share2 },
                        { id: 'policy', label: 'AI Policy Expert', icon: Bot, color: '#6366f1' },
                        { id: 'marketplace', label: 'Marketplace', icon: Truck },
                        { id: 'profile', label: 'Profile', icon: User }
                    ].map(item => (
                        <a
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={activeTab === item.id ? 'active' : ''}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 15px', borderRadius: '10px',
                                cursor: 'pointer', transition: '0.2s', textDecoration: 'none',
                                background: activeTab === item.id ? '#eef2ff' : 'transparent',
                                color: activeTab === item.id ? '#6366f1' : '#64748b',
                                fontWeight: activeTab === item.id ? '700' : '500'
                            }}
                        >
                            <item.icon size={20} /> {item.label}
                        </a>
                    ))}
                </nav>
                <div
                    className="logout"
                    onClick={() => { localStorage.clear(); navigate('/'); }}
                    style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}
                >
                    <LogOut size={20} /> Logout
                </div>
            </aside>

            <main className="main-content" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
