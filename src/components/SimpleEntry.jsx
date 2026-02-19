import { useState, useRef } from "react";
import { User, Upload, Check, Move } from "lucide-react";

function getDeviceId() {
  let deviceId = localStorage.getItem("device-id");
  if (!deviceId) {
    deviceId =
      "device-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("device-id", deviceId);
  }
  return deviceId;
}

export function SimpleEntry({ onComplete }) {
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setImagePosition({ x: 50, y: 50 }); // Reset position for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (!avatarPreview) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    setImagePosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!avatarPreview) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const container = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - container.left) / container.width) * 100;
    const y = ((touch.clientY - container.top) / container.height) * 100;

    setImagePosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const deviceId = getDeviceId();

      // Create cropped avatar if image exists
      let croppedAvatar = null;
      if (avatarPreview && containerRef.current) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 200;
        canvas.height = 200;

        const img = new Image();
        img.src = avatarPreview;

        await new Promise((resolve) => {
          img.onload = () => {
            // Draw image centered on the selected position
            const scale = Math.max(200 / img.width, 200 / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            const offsetX = (200 - scaledWidth) * (imagePosition.x / 100);
            const offsetY = (200 - scaledHeight) * (imagePosition.y / 100);

            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            croppedAvatar = canvas.toDataURL("image/jpeg", 0.8);
            resolve();
          };
        });
      }

      const profile = {
        id: `${deviceId}-${Date.now()}`,
        deviceId: deviceId,
        name: name.trim(),
        avatar: croppedAvatar,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(`user-profile-${deviceId}`, JSON.stringify(profile));
      onComplete(profile);
    } catch (err) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-blue-200">Set up your profile on this device</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div
                ref={containerRef}
                className="relative group w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl border-4 border-white/20 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {avatarPreview ? (
                  <img
                    ref={imageRef}
                    src={avatarPreview}
                    alt="Avatar"
                    className="absolute w-full h-full object-cover pointer-events-none select-none"
                    style={{
                      objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                    }}
                    draggable="false"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <label
                  htmlFor="avatar"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {avatarPreview ? (
                    <>
                      <Move className="w-6 h-6 text-white mb-1" />
                      <span className="text-xs text-white font-medium">
                        Drag to Reposition
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs text-white font-medium">
                        Add Photo
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-blue-200 mt-3 text-center">
                {avatarFile ? (
                  <>
                    Photo selected! ✓<br />
                    <span className="text-xs opacity-75">
                      Drag the image to reposition
                    </span>
                  </>
                ) : (
                  "Click to add your photo (optional)"
                )}
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Get Started
                </>
              )}
            </button>

            <p className="text-center text-xs text-blue-300">
              Your profile is saved on this device only
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
