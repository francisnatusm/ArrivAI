import { useState } from 'react';
import { submitProfile } from './lib/api.js';
import Header from './components/Header.jsx';
import ProfileForm from './components/ProfileForm.jsx';
import KoreaMap from './components/KoreaMap.jsx';
import IRSScoreCard from './components/IRSScoreCard.jsx';
import CityPanel from './components/CityPanel.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import ProfileSummary from './components/ProfileSummary.jsx';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  async function handleProfileSubmit(profile) {
    setLoading(true);
    setError('');
    try {
      const data = await submitProfile(profile);
      const initialCity =
        data.recommendedCity ||
        data.cities?.find((c) => c.id === profile.targetCity) ||
        data.cities?.[0];
      setDashboard(data);
      setSelectedCity(initialCity);
    } catch (err) {
      setError(err.message || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setDashboard(null);
    setSelectedCity(null);
    setError('');
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        {error && (
          <p className="mx-auto max-w-lg px-6 text-center text-sm text-danger">{error}</p>
        )}
        <ProfileForm onSubmit={handleProfileSubmit} loading={loading} />
      </div>
    );
  }

  const { profile, cities, sessionId, recommendedCity, bestOverallCity, targetCityFit, influence } = dashboard;
  const focusCity = selectedCity || recommendedCity;
  const chatContext = { profile, cities, sessionId };
  const irsLabel =
    profile.targetCity !== 'suggest' && focusCity?.id === profile.targetCity
      ? 'Your target city IRS'
      : focusCity?.id === recommendedCity?.id
        ? 'Best match IRS'
        : 'Selected city IRS';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-transparent">
      <Header compact />
      <ProfileSummary
        profile={profile}
        recommendedCity={recommendedCity}
        bestOverallCity={bestOverallCity}
        targetCityFit={targetCityFit}
        influence={influence}
        cityCount={cities?.length}
      />
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:p-4">
        {/* Map — left / center */}
        <div className="relative min-h-[280px] flex-1 md:min-h-0">
          <KoreaMap
            cities={cities}
            selectedCityId={focusCity?.id}
            onSelectCity={setSelectedCity}
          />
          <button
            type="button"
            onClick={handleReset}
            className="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-navy/90 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            ← New profile
          </button>
        </div>

        {/* Right column — IRS + city panel */}
        <div className="flex w-full flex-col gap-3 md:w-[340px] lg:w-[380px]">
          <IRSScoreCard
            score={focusCity?.irs}
            cityName={focusCity?.name}
            label={irsLabel}
            profile={profile}
          />

          {focusCity && (
            <div className="min-h-0 flex-1">
              <CityPanel
                city={focusCity}
                profile={profile}
                onClose={() => setSelectedCity(recommendedCity)}
              />
            </div>
          )}
        </div>
      </div>

      <ChatAssistant context={chatContext} />
    </div>
  );
}
