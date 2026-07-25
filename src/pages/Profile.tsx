import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-background" />
        
        <div className="relative px-6 pb-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-accent flex items-center justify-center shadow-2xl">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-background rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium">Profile</p>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mt-2">
                {user?.name}
              </h1>
              <p className="text-muted-foreground mt-4">
                0 Public Playlists • 0 Followers • 0 Following
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-32 space-y-8">
        {/* Top Artists Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top artists this month</h2>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Show all
            </button>
          </div>
          <p className="text-muted-foreground">
            Only visible to you
          </p>
          <div className="mt-4 p-8 bg-card rounded-lg text-center">
            <p className="text-muted-foreground">
              Listen to more music to see your top artists
            </p>
          </div>
        </section>

        {/* Top Tracks Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top tracks this month</h2>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Show all
            </button>
          </div>
          <p className="text-muted-foreground">
            Only visible to you
          </p>
          <div className="mt-4 p-8 bg-card rounded-lg text-center">
            <p className="text-muted-foreground">
              Listen to more music to see your top tracks
            </p>
          </div>
        </section>

        {/* Public Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Public Playlists</h2>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Show all
            </button>
          </div>
          <div className="mt-4 p-8 bg-card rounded-lg text-center">
            <p className="text-muted-foreground">
              You haven't created any public playlists yet
            </p>
          </div>
        </section>

        {/* Following */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Following</h2>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Show all
            </button>
          </div>
          <div className="mt-4 p-8 bg-card rounded-lg text-center">
            <p className="text-muted-foreground">
              You aren't following anyone yet
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
