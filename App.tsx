import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisView from './components/AnalysisView';
import AdResultView from './components/AdResultView';
import HistoryList from './components/HistoryList';
import { analyzeCarImage, generateAds } from './services/geminiService';
import { getHistory, saveHistoryItem, deleteHistoryItem } from './services/storageService';
import { AdContent, AnalysisResult, AppState, CarDetails, HistoryItem } from './types';

// Standard helper for mobile-safe file processing
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AutomotiveFluidBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#F9FBFB]">
    <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full opacity-40 blur-3xl" style={{background: 'radial-gradient(circle at center, rgba(120,184,51,0.25) 0%, rgba(255,255,255,0) 70%)'}} />
    <div className="absolute bottom-[-20%] left-[-10%] w-[90vw] h-[90vw] rounded-full opacity-30 blur-3xl" style={{background: 'radial-gradient(circle at center, rgba(16,58,47,0.3) 0%, rgba(255,255,255,0) 70%)'}} />
  </div>
);

interface LeftColumnProps {
  images: string[];
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  carDetails: CarDetails;
}

const LeftColumnContent: React.FC<LeftColumnProps> = ({ 
  images, 
  activeImageIndex, 
  setActiveImageIndex, 
  carDetails 
}) => (
  <div className="space-y-6">
     <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-lg">
        <div className="relative h-64 bg-gray-900 flex items-center justify-center">
           {images.length > 0 ? (
              <img src={images[activeImageIndex]} alt="Car View" className="w-full h-full object-contain" />
           ) : (
              <div className="text-gray-500 text-xs text-center p-8 uppercase tracking-widest opacity-50">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Фото недоступне (Архів)
              </div>
           )}
        </div>
        {images.length > 1 && (
          <div className="p-4 bg-white/40 border-t border-white/50 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)} 
                  className={`w-12 h-12 flex-shrink-0 rounded border-2 ${i === activeImageIndex ? 'border-skoda-emerald' : 'border-transparent'}`}
                  aria-label={`Переглянути зображення ${i + 1}`}
                >
                  <img src={img} className="w-full h-full object-cover rounded" alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
          </div>
        )}
     </div>

     <div className="glass-panel rounded-2xl p-6 border-l-4 border-skoda-emerald">
        <h3 className="text-skoda-emerald font-bold text-sm mb-4 uppercase">Характеристики</h3>
        <div className="space-y-2 text-sm">
           <div className="flex justify-between border-b pb-1"><span>Модель</span><span className="font-bold">{carDetails.model}</span></div>
           <div className="flex justify-between border-b pb-1"><span>Рік</span><span className="font-bold">{carDetails.year}</span></div>
           <div className="flex justify-between border-b pb-1"><span>Пробіг</span><span className="font-bold">{carDetails.mileage} км</span></div>
           <div className="flex justify-between pt-1 font-bold text-skoda-emerald"><span>Ціна</span><span>${carDetails.price}</span></div>
        </div>
     </div>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [images, setImages] = useState<string[]>([]); 
  const [base64Images, setBase64Images] = useState<string[]>([]); 
  
  const [carDetails, setCarDetails] = useState<CarDetails>({ 
    model: '', year: '', mileage: '', price: '', engineVolume: '', fuelType: '', trimLevel: '', additionalInfo: ''
  });
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [ads, setAds] = useState<AdContent | null>(null);
  
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  // Memory Management: Automatically revoke Blob URLs when images change or component unmounts
  useEffect(() => {
    return () => {
      images.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const handleStartAnalysis = async (files: File[], details: CarDetails) => {
    setAppState(AppState.ANALYZING);
    setActiveImageIndex(0);
    
    const sessionId = currentSessionId || Date.now().toString();
    setCurrentSessionId(sessionId);

    try {
      // Direct Base64 conversion for API stability
      const base64s = await Promise.all(files.map(file => fileToBase64(file)));
      const result = await analyzeCarImage(base64s, details);
      
      const displayUrls = files.map(file => URL.createObjectURL(file));
      
      setImages(displayUrls);
      setBase64Images(base64s);
      setCarDetails(details);
      setAnalysis(result);
      setAppState(AppState.REVIEW);
      
      toast.success("Аналіз успішно завершено!", {
        duration: 3000,
      });

      const newItem: HistoryItem = {
        id: sessionId,
        timestamp: Date.now(),
        carDetails: details,
        analysis: result,
        ads: null,
        images: [] // CRITICAL: Stop saving images to history to prevent storage crashes
      };
      setHistoryItems(saveHistoryItem(newItem));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Помилка аналізу. Перевірте з'єднання.";
      toast.error(errorMessage);
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerateAds = async () => {
    // FIX: Removed "|| base64Images.length === 0" to allow generating ads from history (which has no images)
    if (!analysis) return;
    
    setAppState(AppState.GENERATING_ADS);
    try {
      const generatedAds = await generateAds(analysis, base64Images, carDetails);
      setAds(generatedAds);
      setAppState(AppState.DONE);

      toast.success("Маркетингові тексти готові!", {
        duration: 4000,
      });

      if (currentSessionId) {
        const newItem: HistoryItem = {
          id: currentSessionId,
          timestamp: Date.now(),
          carDetails: carDetails,
          analysis: analysis,
          ads: generatedAds,
          images: [] // CRITICAL: Stop saving images to history to prevent storage crashes
        };
        setHistoryItems(saveHistoryItem(newItem));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Помилка генерації текстів.";
      toast.error(errorMessage);
      setAppState(AppState.REVIEW);
    }
  };

  const handleHardReset = () => {
    // Note: useEffect will handle the revocation of old URLs when setImages([]) is called
    setAppState(AppState.IDLE);
    setImages([]);
    setBase64Images([]);
    setCarDetails({ model: '', year: '', mileage: '', price: '', engineVolume: '', fuelType: '', trimLevel: '', additionalInfo: '' });
    setAnalysis(null);
    setAds(null);
    setCurrentSessionId(null);
    setActiveImageIndex(0);
  };

  const handleRestoreSession = (item: HistoryItem) => {
    setCarDetails(item.carDetails);
    setAnalysis(item.analysis);
    setAds(item.ads);
    setImages(item.images || []); // History items now have empty images
    setBase64Images(item.images || []);
    setCurrentSessionId(item.id);
    setActiveImageIndex(0);
    setAppState(item.ads ? AppState.DONE : AppState.REVIEW);
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-[#F9FBFB]">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#103A2F', // Skoda Emerald
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 58, 47, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#78B833', // Skoda Electric
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          }
        }}
      />
      <AutomotiveFluidBackground />
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 relative z-10">
        {appState === AppState.IDLE ? (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-skoda-emerald mb-2">Sales Assistant</h2>
               <p className="text-gray-500">Швидкий аналіз авто та генерація оголошень Škoda.</p>
            </div>
            <ImageUploader onStartAnalysis={handleStartAnalysis} />
            <HistoryList items={historyItems} onSelect={handleRestoreSession} onDelete={(id, e) => { e.stopPropagation(); if (confirm("Видалити?")) setHistoryItems(deleteHistoryItem(id)); }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              <div className="lg:col-span-4">
                <LeftColumnContent 
                  images={images} 
                  activeImageIndex={activeImageIndex} 
                  setActiveImageIndex={setActiveImageIndex} 
                  carDetails={carDetails} 
                />
              </div>
              <div className="lg:col-span-8">
                 {appState === AppState.ANALYZING ? (
                    <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-3xl h-64">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-skoda-emerald rounded-full animate-spin"></div>
                      <p className="mt-4 font-bold text-skoda-emerald">Триває аналіз...</p>
                    </div>
                 ) : (appState === AppState.REVIEW || appState === AppState.GENERATING_ADS) && analysis ? (
                    <AnalysisView 
                      analysis={analysis} carDetails={carDetails} images={images} 
                      onGenerate={handleGenerateAds} onViewExisting={() => setAppState(AppState.DONE)}
                      onReset={handleHardReset} hasExistingAds={!!ads} isLoading={appState === AppState.GENERATING_ADS} 
                    />
                 ) : appState === AppState.DONE && ads ? (
                    <AdResultView ads={ads} onReset={handleHardReset} onBack={() => setAppState(AppState.REVIEW)} onRegenerate={handleGenerateAds} />
                 ) : null}
              </div>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-gray-400 text-xs relative z-10">
        <p>© {new Date().getFullYear()} Škoda Auto. Mobile Stable v1.4</p>
      </footer>
    </div>
  );
};

export default App;