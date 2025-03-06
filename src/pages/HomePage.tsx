import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Plus, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { generateImage } from '../lib/openai';
import { uploadImage, generateStoragePath } from '../lib/storage';

const storyElements = {
  Adventure: {
    settings: [
      'enchanted forest with glowing mushrooms',
      'floating islands in the sunset sky',
      'crystal caves filled with rainbow gems',
      'ancient ruins with magical doorways',
      'magical treehouse that changes seasons',
      'underwater city of merfolk',
      'cloud castle above the storms',
      'desert oasis with flying carpets',
      'lost valley of friendly dragons',
      'mysterious garden of talking flowers'
    ],
    companions: [
      'wise owl with spectacles',
      'playful baby dragon',
      'time-traveling unicorn',
      'rainbow-feathered phoenix',
      'mischievous fairy with starlight wings',
      'talking map with a sense of humor',
      'brave knight made of living origami',
      'floating lantern with a gentle soul',
      'magical compass that points to dreams',
      'friendly ghost who loves adventures'
    ],
    challenges: [
      'crossing a bridge made of starlight',
      'solving riddles from ancient trees',
      'helping lost magical creatures find home',
      'finding a treasure that grants wishes',
      'restoring colors to a faded rainbow',
      'waking up sleeping clouds',
      'teaching young dragons to fly',
      'building a bridge between two worlds',
      'collecting moonbeams in a jar',
      'finding the lost song of the wind'
    ],
    lessons: [
      'courage comes from the heart',
      'true magic lies in believing',
      'imagination can change the world',
      'every friend is a new adventure',
      'kindness is the greatest power',
      'dreams can light the darkest path',
      'helping others brings joy',
      'being different makes you special',
      'every challenge makes you stronger',
      'adventure lives in everyday moments'
    ]
  },
  Safari: {
    settings: [
      'golden savanna at sunrise',
      'misty rainforest canopy',
      'peaceful waterfall oasis',
      'hidden valley of rare animals',
      'ancient baobab grove at twilight',
      'moonlit watering hole',
      'butterfly-filled meadow',
      'elephant path through tall grass',
      'zebra crossing under rainbow',
      'giraffe lookout point'
    ],
    companions: [
      'wise elephant matriarch',
      'playful giraffe twins',
      'brave lion cub',
      'clever meerkat family',
      'gentle zebra elder',
      'chatty parrot guide',
      'mysterious leopard',
      'helpful honey badger',
      'dancing flamingo',
      'stargazing cheetah'
    ],
    challenges: [
      'guiding lost baby animals home',
      'protecting the last water source',
      'bringing rain to dry lands',
      'healing sick animals with herbs',
      'uniting different animal families',
      'finding rare night blooming flowers',
      'building bridges across rivers',
      'sharing limited resources',
      'warning others about danger',
      'creating peace between rivals'
    ],
    lessons: [
      'nature connects all living things',
      'working together brings success',
      'every creature has value',
      'differences make us stronger',
      'caring for our environment',
      'patience brings rewards',
      'wisdom comes from listening',
      'change can be good',
      'small actions matter',
      'respect earns respect'
    ]
  },
  Friendship: {
    settings: [
      'magical garden of forever flowers',
      'rainbow meadow after rain',
      'starlit park with wish fountains',
      'cozy treehouse village',
      'enchanted playground at dawn',
      'butterfly sanctuary',
      'friendship bridge over gentle stream',
      'secret clubhouse in the clouds',
      'musical forest grove',
      'garden of glowing fireflies'
    ],
    companions: [
      'shy butterfly with rainbow wings',
      'lonely cloud seeking friends',
      'musical bird who cant sing',
      'colorful chameleon artist',
      'friendly squirrel collector',
      'lost star looking for home',
      'dancing flower in need of sun',
      'echo learning to speak',
      'young tree growing alone',
      'misunderstood thunder'
    ],
    challenges: [
      'organizing a welcome party',
      'cheering up the sad moon',
      'building a friendship rainbow',
      'sharing magical moments',
      'creating harmony in chaos',
      'finding common ground',
      'healing a broken heart',
      'learning to trust others',
      'celebrating differences',
      'overcoming shyness'
    ],
    lessons: [
      'friendship grows like flowers',
      'everyone needs a friend',
      'sharing doubles the joy',
      'understanding takes time',
      'true friends accept you',
      'kindness creates bonds',
      'differences make friendship special',
      'friends help you grow',
      'together is better',
      'friendship is magic'
    ]
  },
  Kindness: {
    settings: [
      'whispering woods of gentle thoughts',
      'heart valley in bloom',
      'kindness kingdom of helping hands',
      'giving garden of endless growth',
      'harmony hills at daybreak',
      'compassion cove by the sea',
      'gratitude grove in spring',
      'empathy island',
      'caring creek',
      'gentle meadow of new beginnings'
    ],
    companions: [
      'gentle deer who helps others',
      'caring rabbit healer',
      'helpful hedgehog gardener',
      'loving dove messenger',
      'generous chipmunk baker',
      'kind wolf protector',
      'sharing bear',
      'nurturing mouse teacher',
      'thoughtful fox friend',
      'healing hummingbird'
    ],
    challenges: [
      'spreading joy to the sad',
      'helping gardens grow',
      'sharing light in darkness',
      'healing wounded hearts',
      'creating smiles everywhere',
      'teaching kindness to others',
      'finding good in everything',
      'showing patience and care',
      'helping without reward',
      'understanding others pain'
    ],
    lessons: [
      'kindness ripples forever',
      'giving is receiving',
      'compassion heals all',
      'small acts matter most',
      'love grows when shared',
      'everyone deserves kindness',
      'gentle words have power',
      'helping lifts all hearts',
      'kindness starts with you',
      'care changes everything'
    ]
  }
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateStoryContent(childName: string, theme: string, customPrompt?: string): string {
  const elements = storyElements[theme as keyof typeof storyElements];
  const setting = getRandomElement(elements.settings);
  const companion = getRandomElement(elements.companions);
  const challenge = getRandomElement(elements.challenges);
  const lesson = getRandomElement(elements.lessons);

  const storyTemplates = [
    `In a magical place called ${setting}, there lived a wonderful child named ${childName}. One extraordinary day, ${childName} met a ${companion} who became their special friend and guide.

Together, they discovered that ${setting} needed their help with ${challenge}. ${childName}'s heart was filled with determination to make a difference.

With courage and creativity, ${childName} and their new friend worked together, facing each challenge with a smile. They learned about ${lesson} along the way.

Their adventure brought joy and wonder to everyone they met, transforming ${setting} into an even more magical place. ${childName}'s kindness and bravery made all the difference.

As the stars began to twinkle in the evening sky, ${childName} realized that the greatest magic of all lies in our hearts, and that every act of kindness creates a new kind of wonder.`,

    `Deep within the mystical ${setting}, a remarkable child named ${childName} was about to begin an incredible journey. When a ${companion} appeared with a special invitation, ${childName} knew this would be no ordinary day.

The ${companion} revealed that they needed help with ${challenge}. Without hesitation, ${childName} agreed to help, feeling both excited and a little nervous about the adventure ahead.

Through magical moments and surprising discoveries, ${childName} and their new friend worked together in ways they never imagined. Each step taught them more about ${lesson}.

Their efforts brought amazing changes to ${setting}, touching the hearts of all who lived there. ${childName}'s presence made everything brighter and more beautiful.

As the adventure came to an end, ${childName} understood that magic isn't just in enchanted places - it's in the way we care for others and believe in ourselves.`,

    `Once upon a time, in the heart of ${setting}, there was a special child named ${childName} who had a wonderful gift for making others smile. One magical morning, they encountered a ${companion} who needed their help.

The ${companion} told ${childName} about ${challenge}, and together they set off on an amazing journey. Along the way, they met many new friends who joined their quest.

Through teamwork and determination, ${childName} showed everyone the importance of ${lesson}. Their adventure brought positive changes to every corner of ${setting}.

Each step of their journey revealed new wonders and created lasting friendships. ${childName}'s kind heart and brave spirit inspired everyone they met.

When the sun set on their magical day, ${childName} had not only helped solve the challenge but had also discovered the extraordinary power of believing in oneself and others.`
  ];

  let selectedTemplate = getRandomElement(storyTemplates);
  
  if (customPrompt) {
    selectedTemplate = `${selectedTemplate}\n\n${customPrompt}`;
  }

  return selectedTemplate;
}

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');

  React.useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('profile_id', user!.id);
    
    if (!error && data) {
      setChildren(data);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAddChild = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .insert({
          profile_id: user!.id,
          name: newChildName,
          age: parseInt(newChildAge),
        })
        .select()
        .single();

      if (error) throw error;

      setChildren([...children, data]);
      setSelectedChild(data.id);
      setNewChildName('');
      setNewChildAge('');
      setShowAddChild(false);
      setIsChildMenuOpen(false);
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      navigate('/profile');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedChildData = children.find(child => child.id === selectedChild);
      
      const storyContent = generateStoryContent(
        selectedChildData.name, 
        selectedTheme,
        storyPrompt
      );

      const photoPath = generateStoragePath('child-photos', selectedFile!);
      const childPhotoUrl = await uploadImage(selectedFile!, photoPath);

      const coverPrompt = `Create a magical storybook cover illustration featuring a child named ${selectedChildData.name} embarking on a ${selectedTheme.toLowerCase()} journey. ${storyPrompt} The scene should be whimsical and enchanting, perfect for a children's bedtime story.`;
      const coverImageUrl = await generateImage(coverPrompt, {
        theme: selectedTheme
      });

      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          child_id: selectedChild,
          theme: selectedTheme,
          content: storyContent,
          image_url: coverImageUrl,
          child_photo_url: childPhotoUrl,
          page_images: []
        })
        .select()
        .single();

      if (storyError) throw storyError;

      navigate('/my-stories');
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-boho font-bold text-boho-stone mb-4">
          Welcome to Magical Bedtime Stories
        </h1>
        <p className="text-lg text-boho-stone/70 mb-8">
          Please sign in to create magical stories for your children
        </p>
        <Button onClick={() => navigate('/profile')}>
          Sign In to Get Started
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-boho font-bold text-boho-stone mb-4">
          Create a New Story
        </h1>
        <p className="text-lg text-boho-stone/70">
          Transform your child into the hero of their very own bedtime adventure
        </p>
      </div>

      <div className="relative w-full max-w-6xl mx-auto hidden md:block">
        <div className="absolute inset-0 bg-black/10 blur-xl transform scale-95 translate-y-4"></div>
        
        <div className="relative grid grid-cols-2 gap-0 bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Left page */}
          <div className="book-page book-page-left">
            <div className="book-spine"></div>
            <div className="book-content">
              <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6">
                1. Select Child
              </h2>
              {/* Child selection dropdown */}
              <div className="relative mb-8">
                <button
                  onClick={() => setIsChildMenuOpen(!isChildMenuOpen)}
                  className="w-full px-4 py-2.5 text-left boho-input flex items-center justify-between"
                >
                  <span className="block truncate">
                    {selectedChild
                      ? children.find(child => child.id === selectedChild)?.name
                      : "Select a child"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-boho-stone/70 transition-transform ${
                      isChildMenuOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isChildMenuOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-boho-clay/20">
                    <div className="py-1">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            setSelectedChild(child.id);
                            setIsChildMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-boho-cream/50 ${
                            selectedChild === child.id ? "bg-boho-cream/30" : ""
                          }`}
                        >
                          {child.name} (Age: {child.age})
                        </button>
                      ))}
                      <div className="border-t border-boho-clay/10">
                        {!showAddChild ? (
                          <button
                            onClick={() => setShowAddChild(true)}
                            className="w-full px-4 py-2 text-left text-boho-stone hover:bg-boho-cream/50 flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add New Child
                          </button>
                        ) : (
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-boho-stone">Add New Child</h3>
                              <button
                                onClick={() => setShowAddChild(false)}
                                className="text-boho-stone/70 hover:text-boho-stone"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={newChildName}
                              onChange={(e) => setNewChildName(e.target.value)}
                              placeholder="Child's name"
                              className="w-full boho-input"
                            />
                            <input
                              type="number"
                              value={newChildAge}
                              onChange={(e) => setNewChildAge(e.target.value)}
                              placeholder="Age"
                              className="w-full boho-input"
                            />
                            <Button
                              onClick={handleAddChild}
                              disabled={!newChildName || !newChildAge}
                              className="w-full"
                            >
                              Add Child
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6">
                2. Upload a Photo
              </h2>
              <FileUpload onFileSelect={handleFileSelect} previewUrl={previewUrl} />
            </div>
          </div>

          {/* Right page */}
          <div className="book-page book-page-right">
            <div className="book-spine book-spine-right"></div>
            <div className="book-content">
              <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6">
                3. Choose Story Theme
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {['Adventure', 'Safari', 'Friendship', 'Kindness'].map((theme) => (
                  <Button
                    key={theme}
                    variant="secondary"
                    className={`w-full ${selectedTheme === theme ? 'ring-2 ring-boho-stone bg-boho-cream' : ''}`}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    {theme}
                  </Button>
                ))}
              </div>

              <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6 mt-8">
                4. Add Story Details
              </h2>
              <div className="space-y-4">
                <textarea
                  value={storyPrompt}
                  onChange={(e) => setStoryPrompt(e.target.value)}
                  placeholder="Add any special details or elements you'd like to include in the story... (optional)"
                  className="w-full h-32 boho-input resize-none"
                />
              </div>

              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!selectedChild || !selectedFile || !selectedTheme || isGenerating}
                  className="w-full"
                >
                  <Wand2 className="inline-block mr-2 h-5 w-5 text-white" />
                  {isGenerating ? 'Creating Magic...' : 'Generate Story'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Papyrus Layout */}
      <div className="md:hidden">
        <div className="papyrus rounded-lg shadow-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6">
              1. Select Child
            </h2>
            <div className="relative mb-8">
              <button
                onClick={() => setIsChildMenuOpen(!isChildMenuOpen)}
                className="w-full px-4 py-2.5 text-left boho-input flex items-center justify-between"
              >
                <span className="block truncate">
                  {selectedChild
                    ? children.find(child => child.id === selectedChild)?.name
                    : "Select a child"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-boho-stone/70 transition-transform ${
                    isChildMenuOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isChildMenuOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-boho-clay/20">
                  <div className="py-1">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChild(child.id);
                          setIsChildMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-boho-cream/50 ${
                          selectedChild === child.id ? "bg-boho-cream/30" : ""
                        }`}
                      >
                        {child.name} (Age: {child.age})
                      </button>
                    ))}
                    <div className="border-t border-boho-clay/10">
                      {!showAddChild ? (
                        <button
                          onClick={() => setShowAddChild(true)}
                          className="w-full px-4 py-2 text-left text-boho-stone hover:bg-boho-cream/50 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add New Child
                        </button>
                      ) : (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-boho-stone">Add New Child</h3>
                            <button
                              onClick={() => setShowAddChild(false)}
                              className="text-boho-stone/70 hover:text-boho-stone"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            placeholder="Child's name"
                            className="w-full boho-input"
                          />
                          <input
                            type="number"
                            value={newChildAge}
                            onChange={(e) => setNewChildAge(e.target.value)}
                            placeholder="Age"
                            className="w-full boho-input"
                          />
                          <Button
                            onClick={handleAddChild}
                            disabled={!newChildName || !newChildAge}
                            className="w-full"
                          >
                            Add Child
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6">
              2. Upload a Photo
            </h2>
            <FileUpload onFileSelect={handleFileSelect} previewUrl={previewUrl} />

            <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6 mt-8">
              3. Choose Story Theme
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {['Adventure', 'Safari', 'Friendship', 'Kindness'].map((theme) => (
                <Button
                  key={theme}
                  variant="secondary"
                  className={`w-full ${selectedTheme === theme ? 'ring-2 ring-boho-stone bg-boho-cream' : ''}`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  {theme}
                </Button>
              ))}
            </div>

            <h2 className="text-2xl font-boho font-semibold text-boho-stone mb-6 mt-8">
              4. Add Story Details
            </h2>
            <div className="space-y-4">
              <textarea
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                placeholder="Add any special details or elements you'd like to include in the story... (optional)"
                className="w-full h-32 boho-input resize-none"
              />
            </div>

            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedChild || !selectedFile || !selectedTheme || isGenerating}
              className="w-full mt-8"
            >
              <Wand2 className="inline-block mr-2 h-5 w-5 text-white" />
              {isGenerating ? 'Creating Magic...' : 'Generate Story'}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;