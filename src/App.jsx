import { useState, useEffect } from "react";
import { SimpleEntry } from "./components/SimpleEntry";
import { ChatRoom } from "./components/ChatRoom";
import { Calendar, Wrench, Trash2, User } from "lucide-react";

const ROOMS = {
  ministry: {
    id: "ministry-events",
    name: "Ministry Events",
    description: "Schedule, gatherings, and ministry activities",
    icon: Calendar,
    showEvents: true,
  },
  workdays: {
    id: "work-days",
    name: "Community Work Days",
    description: "Help requests and service opportunities",
    icon: Wrench,
    showEvents: false,
  },
};

function getDeviceId() {
  let deviceId = localStorage.getItem("device-id");
  if (!deviceId) {
    deviceId =
      "device-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("device-id", deviceId);
  }
  return deviceId;
}

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState("ministry");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    const savedProfile = localStorage.getItem(`user-profile-${deviceId}`);
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleProfileComplete = (newProfile) => {
    const deviceId = getDeviceId();
    localStorage.setItem(
      `user-profile-${deviceId}`,
      JSON.stringify(newProfile),
    );
    setProfile(newProfile);
  };

  const handleDeleteProfile = () => {
    const deviceId = getDeviceId();
    localStorage.removeItem(`user-profile-${deviceId}`);
    setProfile(null);
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <SimpleEntry onComplete={handleProfileComplete} />;
  }

  const currentRoom = ROOMS[activeRoom];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Delete Profile?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              You'll need to set up your profile again on this device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Men's Ministry
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Room Tabs */}
        <div className="flex border-t border-slate-200 dark:border-slate-700">
          {Object.entries(ROOMS).map(([key, room]) => {
            const Icon = room.icon;
            const isActive = activeRoom === key;
            return (
              <button
                key={key}
                onClick={() => setActiveRoom(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{room.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ChatRoom
          key={currentRoom.id}
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          roomDescription={currentRoom.description}
          userId={profile.id}
          userName={profile.name}
          userAvatar={profile.avatar}
          showEvents={currentRoom.showEvents}
        />
      </div>
    </div>
  );
}

export default App;
