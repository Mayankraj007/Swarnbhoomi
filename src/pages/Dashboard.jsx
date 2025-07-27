import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  CloudSun,
  BarChart3,
  Leaf,
  FileText,
  AlertTriangle,
  SatelliteDish,
  Bot,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          fetchWeatherData(data.district);
        }
      }
      setLoading(false);
    };

    const fetchWeatherData = async (city) => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Weather fetch error:", error.message);
      }
    };

    fetchUserData();
  }, []);

  const generateSuggestions = () => {
    if (!weatherData) return null;

    const crops = userData?.primaryCrops
      ? Object.values(userData.primaryCrops).flat()
      : [];

    if (crops.length === 0) {
      return ["🚨 Please complete your profile to get crop-based weather suggestions."];
    }

    const temp = weatherData.current.temp_c;
    const condition = weatherData.current.condition.text.toLowerCase();
    let suggestions = [];

    crops.forEach((crop) => {
      if (temp > 30 && condition.includes("sun")) {
        suggestions.push(`${crop}: Irrigate regularly due to high temp.`);
      } else if (condition.includes("rain")) {
        suggestions.push(`${crop}: Watch for water logging & diseases.`);
      } else if (temp < 15) {
        suggestions.push(`${crop}: Protect from frost with mulching.`);
      } else {
        suggestions.push(`${crop}: Weather is moderate. Monitor growth.`);
      }
    });

    return suggestions.slice(0, 2);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  if (loading) {
    return <div className="p-1 bg-gray-100 min-h-screen text-base font-poppins">{t("loading")}</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-8 bg-gradient-to-br min-h-screen font-poppins text-gray-800">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800">
              {t("welcome")}, {userData?.fullName || t("farmer")} 👋
            </h1>
            <p className="text-base text-gray-700">
              {userData?.district}, {userData?.state}
            </p>
          </div>
          <div>
            <select
              onChange={handleLanguageChange}
              value={i18n.language}
              className="bg-white border text-sm text-black rounded px-2 py-1"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* Top Weather Bar */}
        <div className="bg-white p-4 rounded-md shadow-sm border mb-8 relative">
          {weatherData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={weatherData.current.condition.icon}
                  alt="Weather Icon"
                  className="h-16 w-16"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {weatherData.location.name}, {weatherData.location.country}
                  </h2>
                  <p className="text-gray-800 text-base">
                    Temp: {weatherData.current.temp_c}°C
                  </p>
                  <p className="text-gray-600 text-sm">
                    {weatherData.current.condition.text}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-green-700 mb-2">
                  {t("Suggestions")}
                </h3>
                {generateSuggestions()?.map((suggestion, index) => (
                  <p
                    key={index}
                    className={`text-sm ${
                      suggestion.includes("complete your profile")
                        ? "text-red-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    •{" "}
                    {suggestion.includes("complete your profile") ? (
                      <Link to="/dashboard/profile" className="underline">
                        {suggestion}
                      </Link>
                    ) : (
                      suggestion
                    )}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("loading_weather")}</p>
          )}
          <Link
            to="/dashboard/weather"
            className="absolute top-5 right-5 text-green-700 hover:underline flex items-center gap-1 font-medium text-sm"
          >
            →
          </Link>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <Card
            to="/dashboard/voiceBot"
            icon={<Bot className="text-green-500" />}
            title={t("voicebot_title")}
            subtitle={t("voicebot_subtitle")}
          />
          <Card
            to="/dashboard/Ndvi"
            icon={<SatelliteDish className="text-blue-500" />}
            title={t("ndvi_title")}
            subtitle={t("ndvi_subtitle")}
          />
          <Card
            to="/dashboard/mandiPage"
            icon={<BarChart3 className="text-yellow-500" />}
            title={t("market_title")}
            subtitle={t("market_subtitle")}
          />
          <Card
            to="/dashboard/cropGuide"
            icon={<Leaf className="text-green-700" />}
            title={t("cropguide_title")}
            subtitle={t("cropguide_subtitle")}
          />
          <Card
            to="/dashboard/farmingAlerts"
            icon={<AlertTriangle className="text-red-500" />}
            title={t("alerts_title")}
            subtitle={t("alerts_subtitle")}
          />
          <Card
            to="/dashboard/schemes"
            icon={<FileText className="text-indigo-600" />}
            title={t("schemes_title")}
            subtitle={t("schemes_subtitle")}
          />
        </div>
      </div>
    </div>
  );
};

const Card = ({ to, icon, title, subtitle }) => {
  return (
    <Link
      to={to}
      className="bg-white border border-gray-300 p-5 rounded-md shadow hover:shadow-md transition-all flex flex-col gap-3 text-center items-center hover:border-green-400"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-snug">{subtitle}</p>
    </Link>
  );
};

export default Dashboard;
