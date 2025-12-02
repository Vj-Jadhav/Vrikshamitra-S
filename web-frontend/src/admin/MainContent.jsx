import React from 'react';
import Header from './Header';
import StatsGrid from './StatsGrid';

export default function MainContent({ activeTab }) {
  const getHeaderContent = () => {
    const content = {
      'dashboard': {
        title: 'Dashboard Overview',
        subtitle: 'Welcome back! Here\'s what\'s happening today.'
      },
      'manage-users': {
        title: 'Manage Users',
        subtitle: 'View and manage all users in the system.'
      },
      'manage-challenges': {
        title: 'Manage Challenges',
        subtitle: 'Create and manage eco-challenges.'
      },
      'leaderboard': {
        title: 'Leaderboard',
        subtitle: 'Track user rankings and eco-points.'
      },
      'reports': {
        title: 'Reports',
        subtitle: 'Generate and view system reports.'
      }
    };

    return content[activeTab] || content.dashboard;
  };

  const headerContent = getHeaderContent();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsGrid />;
      case 'manage-users':
        return <div>Manage Users Content</div>;
      case 'manage-challenges':
        return <div>Manage Challenges Content</div>;
      case 'leaderboard':
        return <div>Leaderboard Content</div>;
      case 'reports':
        return <div>Reports Content</div>;
      default:
        return <StatsGrid />;
    }
  };

  return (
    <main className="flex-1 overflow-auto ml-72">
      <Header title={headerContent.title} subtitle={headerContent.subtitle} />
      <div className="p-8">
        {renderContent()}
      </div>
    </main>
  );
}