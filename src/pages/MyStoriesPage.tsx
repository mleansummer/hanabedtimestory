import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import ImageWithFallback from '../components/ImageWithFallback';

interface Story {
  id: string;
  child_id: string;
  theme: string;
  content: string;
  image_url: string;
  created_at: string;
  children: {
    name: string;
  };
}

function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStories();
    }
  }, [user]);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          children (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      setDeletingStoryId(storyId);
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
      setStories((prevStories) => 
        prevStories.filter((story) => story.id !== storyId)
      );
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setDeletingStoryId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-boho font-bold text-boho-stone mb-4">
          My Stories
        </h1>
        <p className="text-lg text-boho-stone/70">
          All the magical stories created for your children
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="relative group boho-card aspect-square sm:aspect-auto"
          >
            <Link to={`/story/${story.id}`} className="block h-full">
              <div className="relative h-full">
                <ImageWithFallback
                  src={story.image_url}
                  alt={`${story.children.name}'s story`}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-boho-stone/50 to-transparent rounded-lg" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
                    {story.children.name}'s {story.theme} Story
                  </h3>
                  <p className="text-xs sm:text-sm opacity-75">
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteStory(story.id);
              }}
              disabled={deletingStoryId === story.id}
            >
              <Trash2 className={`h-4 w-4 text-boho-stone ${deletingStoryId === story.id ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-boho-stone/70">No stories yet. Create your first story!</p>
          <Link
            to="/"
            className="mt-4 inline-block text-boho-stone hover:text-boho-stone/80"
          >
            Create a Story
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyStoriesPage;