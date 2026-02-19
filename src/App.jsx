import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import html2canvas from 'html2canvas';

// IndexedDB helper functions
const DB_NAME = 'LoveNotesDB';
const STORE_NAME = 'cards';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveCardToDB = async (id, cardData) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, data: cardData });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getCardFromDB = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result?.data);
    request.onerror = () => reject(request.error);
  });
};

const ValentineCardMaker = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [cardElements, setCardElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [background, setBackground] = useState('#ffffff');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const canvasRef = useRef(null);

  // Available stickers
  const stickers = [
    // Custom PNG stickers
    { id: 'best-friends', image: '/stickers/best-friends.png', type: 'image' },
    { id: 'disco-ball', image: '/stickers/disco-ball.png', type: 'image' },
    { id: 'dove', image: '/stickers/dove.png', type: 'image' },
    { id: 'favorite-person', image: '/stickers/favorite-person.png', type: 'image' },
    { id: 'film-strip', image: '/stickers/film-strip.png', type: 'image' },
    { id: 'heart-wax-stamp', image: '/stickers/heart-wax-stamp.png', type: 'image' },
    { id: 'love-you-heart', image: '/stickers/love-you-heart.png', type: 'image' },
    { id: 'love-you-more', image: '/stickers/love-you-more.png', type: 'image' },
    { id: 'love-you', image: '/stickers/love-you.png', type: 'image' },
    { id: 'nikon-cam', image: '/stickers/nikon-cam.png', type: 'image' },
    { id: 'red-clip', image: '/stickers/red-clip.png', type: 'image' },
    { id: 'red-photo-strip', image: '/stickers/red-photo-strip.png', type: 'image' },
    { id: 'swans', image: '/stickers/swans.png', type: 'image' },
    { id: 'te-amo', image: '/stickers/te-amo.png', type: 'image' },
    { id: 'vinyl', image: '/stickers/vinyl.png', type: 'image' },
  ];

  // Background options
  const backgrounds = [
    // Custom image backgrounds
    { id: 'stripe1', value: 'url(/backgrounds/1-stripe.jpg)', name: 'Stripe 1', type: 'image' },
    { id: 'stripe2', value: 'url(/backgrounds/2-stripe.jpg)', name: 'Stripe 2', type: 'image' },
    { id: 'stripe3', value: 'url(/backgrounds/3-stripe.jpg)', name: 'Stripe 3', type: 'image' },
    { id: 'stripe4', value: 'url(/backgrounds/4-stripe.jpg)', name: 'Stripe 4', type: 'image' },
    { id: 'blue-gingham', value: 'url(/backgrounds/blue-gingham.jpg)', name: 'Blue Gingham', type: 'image' },
    { id: 'love-everywhere', value: 'url(/backgrounds/love-is-everywhere.jpg)', name: 'Love Is Everywhere', type: 'image' },
    { id: 'maroon-paper', value: 'url(/backgrounds/maroon-paper.jpg)', name: 'Maroon Paper', type: 'image' },
    { id: 'mocha-mousse', value: 'url(/backgrounds/mocha-mousse.jpg)', name: 'Mocha Mousse', type: 'image' },
    { id: 'pink-lined', value: 'url(/backgrounds/pink-lined.jpg)', name: 'Pink Lined', type: 'image' },
    { id: 'pink-paper', value: 'url(/backgrounds/pink-paper.jpg)', name: 'Pink Paper', type: 'image' },
    { id: 'pink-swirl', value: 'url(/backgrounds/pink-swirl.jpg)', name: 'Pink Swirl', type: 'image' },
    { id: 'red-gingham', value: 'url(/backgrounds/red-gingham.jpg)', name: 'Red Gingham', type: 'image' },
    { id: 'white-paper', value: 'url(/backgrounds/white-paper.jpg)', name: 'White Paper', type: 'image' },
  ];

  // Load card from URL parameter
  useEffect(() => {
    const loadCard = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('card');

      if (id) {
        try {
          // Try IndexedDB first
          let cardData = await getCardFromDB(id);

          // Fallback to localStorage for old cards
          if (!cardData) {
            const savedCard = localStorage.getItem(`lovenotes-card-${id}`);
            if (savedCard) {
              cardData = JSON.parse(savedCard);
              // Migrate to IndexedDB
              await saveCardToDB(id, cardData);
              console.log('Migrated card from localStorage to IndexedDB');
            }
          }

          if (cardData) {
            setCardElements(cardData.elements);
            setBackground(cardData.background);
            setYoutubeUrl(cardData.youtubeUrl || '');
            setCardId(id);

            // Enable view mode
            setViewMode(true);
            setShowEnvelope(true);

            // Autoplay music after a short delay
            if (cardData.youtubeUrl && getYoutubeVideoId(cardData.youtubeUrl)) {
              setTimeout(() => {
                setIsMusicPlaying(true);
              }, 1500);
            }
          }
        } catch (error) {
          console.error('Error loading card:', error);
          alert('Failed to load card. The link may be invalid.');
        }
      }
    };

    loadCard();
  }, []);

  const openEnvelope = () => {
    setShowEnvelope(false);
    // Start music when envelope is clicked
    if (youtubeUrl && getYoutubeVideoId(youtubeUrl)) {
      setTimeout(() => {
        setIsMusicPlaying(true);
      }, 500);
    }
  };

  const addSticker = (sticker) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: sticker.type, // either 'emoji' or 'image'
      content: sticker.type === 'emoji' ? sticker.emoji : sticker.image,
      x: 50,
      y: 50,
      size: 64,
      rotation: 0,
      layer: cardElements.length + 1,
    };
    setCardElements([...cardElements, newElement]);
    setShowStickers(false);
  };

  const addText = () => {
    const newId = `text-${Date.now()}`;
    const newElement = {
      id: newId,
      type: 'text',
      content: 'Your text here',
      x: 50,
      y: 50,
      size: 32,
      rotation: 0,
      layer: cardElements.length + 1,
      color: '#000000',
      font: "'Playfair Display', serif",
      textAlign: 'center',
    };

    setCardElements([...cardElements, newElement]);

    // Wait a tiny moment then select the new element
    setTimeout(() => {
      setSelectedElement(newId);
    }, 50);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement = {
          id: `element-${Date.now()}`,
          type: 'image',
          content: event.target.result,
          x: 50,
          y: 50,
          size: 150,
          rotation: 0,
          layer: cardElements.length + 1,
        };
        setCardElements([...cardElements, newElement]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const deleteElement = (id) => {
    setCardElements(cardElements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const updateElement = (id, updates) => {
    setCardElements(cardElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This cannot be undone.')) {
      setCardElements([]);
      setSelectedElement(null);
    }
  };

  const bringToFront = (id) => {
    const maxLayer = Math.max(...cardElements.map(el => el.layer));
    updateElement(id, { layer: maxLayer + 1 });
  };

  const sendToBack = (id) => {
    const minLayer = Math.min(...cardElements.map(el => el.layer));
    updateElement(id, { layer: minLayer - 1 });
  };

  const duplicateElement = (id) => {
    const elementToDuplicate = cardElements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: `element-${Date.now()}`,
        x: elementToDuplicate.x + 5,
        y: elementToDuplicate.y + 5,
        layer: cardElements.length + 1,
      };
      setCardElements([...cardElements, newElement]);
      setSelectedElement(newElement.id);
    }
  };

  // Save current state to history whenever elements change
  const saveToHistory = (elements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCardElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCardElements(history[historyIndex + 1]);
    }
  };

  // Update setCardElements to save history
  useEffect(() => {
    if (cardElements.length > 0 || historyIndex === -1) {
      saveToHistory(cardElements);
    }
  }, [cardElements]);

  const applyTemplate = (template) => {
    setBackground(template.background);
    setCardElements(template.elements.map(el => ({ ...el, id: `element-${Date.now()}-${el.id}` })));
    setShowTemplates(false);
  };

  const saveCard = async () => {
    try {
      const id = cardId || `card-${Date.now()}`;
      const cardData = {
        elements: cardElements,
        background: background,
        youtubeUrl: youtubeUrl,
      };

      // Save to IndexedDB instead of localStorage
      await saveCardToDB(id, cardData);
      setCardId(id);

      const shareUrl = `${window.location.origin}${window.location.pathname}?card=${id}`;
      setShareUrl(shareUrl);
      setShowShareModal(true);

      console.log('Card saved successfully to IndexedDB');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save card. Please try again.');
    }
  };

  const downloadCard = async () => {
    try {
      const canvasElement = canvasRef.current;
      const canvasWidth = viewMode ? 600 : 450;
      const canvasHeight = viewMode ? 800 : 600;

      // Create a temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth * 2; // 2x for better quality
      tempCanvas.height = canvasHeight * 2;
      const ctx = tempCanvas.getContext('2d');

      // Scale context for 2x resolution
      ctx.scale(2, 2);

      // Draw background
      if (background.startsWith('url(')) {
        // Background image
        const imgUrl = background.match(/url\(['"]?([^'"()]+)['"]?\)/)[1];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imgUrl;
        });
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      } else {
        // Solid color or gradient
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Sort elements by layer
      const sortedElements = [...cardElements].sort((a, b) => a.layer - b.layer);

      // Draw each element
      for (const element of sortedElements) {
        ctx.save();

        const x = (element.x / 100) * canvasWidth;
        const y = (element.y / 100) * canvasHeight;

        ctx.translate(x, y);
        ctx.rotate((element.rotation * Math.PI) / 180);

        if (element.type === 'emoji') {
          ctx.font = `${element.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'text') {
          ctx.font = `${element.size}px ${element.font}`;
          ctx.fillStyle = element.color;
          ctx.textAlign = element.textAlign || 'center';
          ctx.textBaseline = 'middle';

          const lines = element.content.split('\n');
          lines.forEach((line, i) => {
            const yOffset = (i - (lines.length - 1) / 2) * element.size * 1.2;
            ctx.fillText(line, 0, yOffset);
          });
        } else if (element.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = element.content;
          });

          // Maintain aspect ratio
          const aspectRatio = img.width / img.height;
          let drawWidth = element.size;
          let drawHeight = element.size;

          if (aspectRatio > 1) {
            drawHeight = element.size / aspectRatio;
          } else {
            drawWidth = element.size * aspectRatio;
          }

          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }

        ctx.restore();
      }

      // Convert to blob and download
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'love-note.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download. Please try again.');
    }
  };

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const toggleMusic = () => {
    if (viewMode) {
      // In view mode, toggle play/pause
      setIsMusicPlaying(!isMusicPlaying);
    } else {
      // In edit mode, also toggle play/pause if URL exists
      if (youtubeUrl && getYoutubeVideoId(youtubeUrl)) {
        setIsMusicPlaying(!isMusicPlaying);
      } else {
        setShowMusicModal(true);
      }
    }
  };

  const FloatingHearts = () => {
    return (
      <div className="floating-hearts">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="floating-heart" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}>
            ❤️
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <FloatingHearts />

      {viewMode && showEnvelope && (
        <div className="envelope-container" onClick={openEnvelope}>
          <div style={{ textAlign: 'center' }}>
            <img
              src="/envelope.png"
              alt="Click to open"
              style={{
                width: '600px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                marginBottom: '0px',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div className="envelope-text" style={{ marginTop: '-50px' }}>Open me</div>
          </div>
        </div>
      )}

      <div className="main-container">
        {!viewMode && (
          <header className="header">
            <h1>Love Notes Studio</h1>
            <p>"Loved you yesterday, love you still, always have, always will." – Elaine Davis</p>
          </header>
        )}

        <div className="content-grid" style={viewMode ? { gridTemplateColumns: '1fr', maxWidth: '600px', margin: '50px auto' } : {}}>
          {!viewMode && (
            <aside className="toolbar">
              <div className="toolbar-section">
                <h3>Quick Start</h3>
                <button className="toolbar-button" onClick={() => setShowBackgrounds(true)}>
                  🎨 Backgrounds
                </button>
              </div>

              <div className="toolbar-section">
                <h3>Add Elements</h3>
                <button className="toolbar-button" onClick={() => setShowStickers(true)}>
                  🖼️ Stickers
                </button>
                <button className="toolbar-button" onClick={addText}>
                  ✏️ Add Text
                </button>
                <button className="toolbar-button" onClick={() => document.getElementById('photo-upload').click()}>
                  📸 Add Photos
                </button>
              </div>

              <div className="toolbar-section">
                <h3>Actions</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    className="toolbar-button secondary"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    style={{ flex: 1, opacity: historyIndex <= 0 ? 0.5 : 1 }}
                  >
                    ↶ Undo
                  </button>
                  <button
                    className="toolbar-button secondary"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    style={{ flex: 1, opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }}
                  >
                    ↷ Redo
                  </button>
                </div>
                <button className="toolbar-button secondary" onClick={saveCard}>
                  💾 Save & Share
                </button>
                <button
                  className="toolbar-button"
                  onClick={clearCanvas}
                  style={{
                    background: '#b14949',
                    marginTop: '8px'
                  }}
                >
                  🗑️ Clear Canvas
                </button>

                <button
                  className="toolbar-button"
                  onClick={() => setShowMusicModal(true)}
                  style={{
                    background: '#b14949',
                    marginTop: '8px'
                  }}
                >
                  🎵 {youtubeUrl ? 'Change Music' : 'Add Music'}
                </button>

              </div>

              {selectedElement && (
                <div className="element-controls">
                  <h3>Element Controls</h3>
                  {cardElements.find(el => el.id === selectedElement)?.type === 'text' && (
                    <>
                      <div className="control-group">
                        <label>Text Content</label>
                        <textarea
                          value={cardElements.find(el => el.id === selectedElement)?.content}
                          onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                        />
                      </div>
                      <div className="control-group">
                        <label>Font</label>
                        <select
                          value={cardElements.find(el => el.id === selectedElement)?.font}
                          onChange={(e) => updateElement(selectedElement, { font: e.target.value })}
                        >
                          <option value="'Playfair Display', serif" style={{ fontFamily: "'Playfair Display', serif" }}>Playfair Display</option>
                          <option value="'Dancing Script', cursive" style={{ fontFamily: "'Dancing Script', cursive" }}>Dancing Script</option>
                          <option value="'Pacifico', cursive" style={{ fontFamily: "'Pacifico', cursive" }}>Pacifico</option>
                          <option value="'Great Vibes', cursive" style={{ fontFamily: "'Great Vibes', cursive" }}>Great Vibes</option>
                          <option value="'Caveat', cursive" style={{ fontFamily: "'Caveat', cursive" }}>Caveat</option>
                          <option value="'Lobster', cursive" style={{ fontFamily: "'Lobster', cursive" }}>Lobster</option>
                          <option value="'Satisfy', cursive" style={{ fontFamily: "'Satisfy', cursive" }}>Satisfy</option>
                          <option value="'Permanent Marker', cursive" style={{ fontFamily: "'Permanent Marker', cursive" }}>Permanent Marker</option>
                          <option value="'Indie Flower', cursive" style={{ fontFamily: "'Indie Flower', cursive" }}>Indie Flower</option>
                          <option value="'Montserrat', sans-serif" style={{ fontFamily: "'Montserrat', sans-serif" }}>Montserrat</option>
                          <option value="serif" style={{ fontFamily: "serif" }}>Serif</option>
                          <option value="sans-serif" style={{ fontFamily: "sans-serif" }}>Sans Serif</option>
                        </select>
                      </div>
                      <div className="control-group">
                        <label>Color</label>
                        <input
                          type="color"
                          value={cardElements.find(el => el.id === selectedElement)?.color}
                          onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                        />
                      </div>

                      <div className="control-group">
                        <label>Text Alignment</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="toolbar-button"
                            onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                            style={{
                              flex: 1,
                              fontSize: '12px',
                              background: cardElements.find(el => el.id === selectedElement)?.textAlign === 'left' ? '#667eea' : '#e0e0e0',
                              color: cardElements.find(el => el.id === selectedElement)?.textAlign === 'left' ? 'white' : '#333'
                            }}
                          >
                            ⬅️ Left
                          </button>
                          <button
                            className="toolbar-button"
                            onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                            style={{
                              flex: 1,
                              fontSize: '12px',
                              background: cardElements.find(el => el.id === selectedElement)?.textAlign === 'center' ? '#667eea' : '#e0e0e0',
                              color: cardElements.find(el => el.id === selectedElement)?.textAlign === 'center' ? 'white' : '#333'
                            }}
                          >
                            ↔️ Center
                          </button>
                          <button
                            className="toolbar-button"
                            onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                            style={{
                              flex: 1,
                              fontSize: '12px',
                              background: cardElements.find(el => el.id === selectedElement)?.textAlign === 'right' ? '#667eea' : '#e0e0e0',
                              color: cardElements.find(el => el.id === selectedElement)?.textAlign === 'right' ? 'white' : '#333'
                            }}
                          >
                            ➡️ Right
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="control-group">
                    <label>Size</label>
                    <input
                      type="range"
                      min="10"
                      max="600"
                      value={cardElements.find(el => el.id === selectedElement)?.size}
                      onChange={(e) => updateElement(selectedElement, { size: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="control-group">
                    <label>Rotation</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={cardElements.find(el => el.id === selectedElement)?.rotation}
                      onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Layer Order</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="toolbar-button"
                        onClick={() => bringToFront(selectedElement)}
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        ⬆️ Bring to Front
                      </button>
                      <button
                        className="toolbar-button"
                        onClick={() => sendToBack(selectedElement)}
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        ⬇️ Send to Back
                      </button>
                    </div>
                  </div>

                  <button
                    className="toolbar-button"
                    onClick={() => duplicateElement(selectedElement)}
                    style={{ marginTop: '10px' }}
                  >
                    📋 Duplicate
                  </button>

                  <button
                    className="toolbar-button secondary"
                    onClick={() => deleteElement(selectedElement)}
                    style={{ marginTop: '10px' }}
                  >
                    🗑️ Delete Element
                  </button>
                </div>
              )}
            </aside>
          )}
          <main className="canvas-container" style={viewMode ? {
            background: 'transparent',
            padding: '0',
            borderRadius: '0',
            marginTop: '80px',
            flexDirection: 'column',
            alignItems: 'center',
            marginLeft: '5px'
          } : {}}>

            <div
              ref={canvasRef}
              className={viewMode ? "canvas view-mode-canvas" : "canvas"}
              style={{ background }}
              onClick={() => !viewMode && setSelectedElement(null)}
            >

              {cardElements.map((element) => (
                <div
                  key={element.id}
                  className={`canvas-element ${element.type} ${selectedElement === element.id ? 'selected' : ''}`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    fontSize: `${element.size}px`,
                    width: element.type === 'image' ? `${element.size}px` : 'auto',
                    height: element.type === 'image' ? `${element.size}px` : 'auto',
                    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                    color: element.color,
                    fontFamily: element.font,
                    textAlign: element.textAlign || 'center',
                    zIndex: element.layer,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startElementX = element.x;
                    const startElementY = element.y;
                    const rect = canvasRef.current.getBoundingClientRect();

                    const handleMouseMove = (moveEvent) => {
                      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                      updateElement(element.id, {
                        x: Math.max(0, Math.min(100, startElementX + deltaX)),
                        y: Math.max(0, Math.min(100, startElementY + deltaY)),
                      });
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  {element.type === 'emoji' ? (
                    element.content
                  ) : element.type === 'text' ? (
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      textAlign: element.textAlign || 'center',
                      wordWrap: 'break-word',
                      maxWidth: '400px'
                    }}>
                      {element.content}
                    </div>
                  ) : (
                    <img src={element.content} alt="sticker" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>

            {!viewMode && (
              <div className="canvas-actions">
                <div className="image-button" onClick={saveCard}>
                  <img src="/save-button.png" alt="Save" />
                  <div className="image-button-text">Share</div>
                </div>
                <div className="image-button" onClick={downloadCard}>
                  <img src="/download-button.png" alt="Download" />
                  <div className="image-button-text">Download</div>
                </div>
              </div>
            )}

            {viewMode && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={downloadCard}
                  style={{
                    padding: '12px 24px',
                    background: '#446A46',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  💾 Download This Card
                </button>
              </div>
            )}

            {/* YouTube Music Player - Hidden */}
            {youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
              <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                {isMusicPlaying && (
                  <iframe
                    key={Date.now()}
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}&mute=0`}
                    allow="autoplay; encrypted-media"
                    style={{ border: 'none' }}
                    title="Background Music"
                  />
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Stickers Modal */}
      {showStickers && (
        <div className="modal-overlay" onClick={() => setShowStickers(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowStickers(false)}>×</button>
            <h2>Add Stickers</h2>
            <div className="sticker-grid">
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="sticker-item"
                  onClick={() => addSticker(sticker)}
                >
                  {sticker.type === 'emoji' ? (
                    sticker.emoji
                  ) : (
                    <img src={sticker.image} alt={sticker.id} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backgrounds Modal */}
      {showBackgrounds && (
        <div className="modal-overlay" onClick={() => setShowBackgrounds(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowBackgrounds(false)}>×</button>
            <h2>Choose Background</h2>

            {/* Custom Color Picker */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                🎨 Custom Color
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  onChange={(e) => {
                    setBackground(e.target.value);
                    setShowBackgrounds(false);
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#666' }}>Pick any color you like</span>
              </div>
            </div>

            {/* Preset Backgrounds */}
            <h3 style={{ fontSize: '16px', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Or Choose a Preset
            </h3>
            <div className="background-grid">
              {backgrounds.map((bg) => (
                <div
                  key={bg.id}
                  className="background-item"
                  style={{ background: bg.value }}
                  onClick={() => {
                    setBackground(bg.value);
                    setShowBackgrounds(false);
                  }}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Music Modal */}
      {showMusicModal && (
        <div className="modal-overlay" onClick={() => setShowMusicModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowMusicModal(false)}>×</button>
            <h2>Add Background Music</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Paste a YouTube link and it will play when recipients view your card
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                YouTube URL
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            {youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
              <div style={{ color: '#4caf50', fontSize: '14px', marginTop: '10px' }}>
                ✓ Valid YouTube link
              </div>
            )}

            <button
              onClick={() => {
                setShowMusicModal(false);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '20px',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowShareModal(false)}>×</button>
            <h2>✨ Card Saved!</h2>
            <p>Share this link with your loved one:</p>
            <div className="share-url">{shareUrl}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              style={{
                padding: '12px 24px',
                background: linkCopied ? '#4caf50' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background 0.3s ease',
              }}
            >
              {linkCopied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {/* Music Toggle */}
      {/* Music Button - Edit mode with URL */}
      {!viewMode && youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
        <button
          className="music-toggle"
          onClick={toggleMusic}
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          <img src="/music-button.jpg" alt="Music" />
        </button>
      )}

      {/* Music Button - Edit mode without URL */}
      {!viewMode && (!youtubeUrl || !getYoutubeVideoId(youtubeUrl)) && (
        <button
          className="music-toggle"
          onClick={() => setShowMusicModal(true)}
          title="Add Music"
        >
          <img src="/music-button.jpg" alt="Add Music" />
        </button>
      )}

      {/* Music Button - View mode */}
      {viewMode && youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
        <button
          className="music-toggle"
          onClick={toggleMusic}
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          <img src="/music-button.jpg" alt="Music" />
        </button>
      )}


      {/* Hidden file input for photo upload */}
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
        onClick={(e) => e.target.value = null}
      />
    </div>
  );
};

export default ValentineCardMaker;