// ============== TEST MODE ==============
const TEST_MODE = false;
const TEST_DAY = 7;

function getTestDayFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const testDay = urlParams.get('testday');
    if (testDay) {
        const day = parseInt(testDay);
        if (day >= 7 && day <= 14) return day;
    }
    return null;
}

function getCurrentDate() {
    const urlTestDay = getTestDayFromURL();
    if (urlTestDay) return new Date(2026, 1, urlTestDay);
    if (TEST_MODE) return new Date(2026, 1, TEST_DAY);
    return new Date();
}

// ============== VALENTINE'S DAYS ==============
const valentineDays = [
    { date: new Date(2026, 1, 7), name: "Rose Day", emoji: "🌹", time: "9:20 AM", note: "Happy Rose Day ra kuchu puchuuuuu!!! Just like a rose, you make my life more beautiful every single day ❤️✨. You make my way of living beautiful ra" },
    { date: new Date(2026, 1, 8), name: "Propose Day", emoji: "💍", time: "9:20 AM", note: "soon baby🙈" },
    { date: new Date(2026, 1, 9), name: "Chocolate Day", emoji: "🍫", time: "9 PM", note: "Happy Chocolate Day ra kuchuu puchuuuu 🍫❤️ You're the only sweet thing I want daily. And I want you to get spoiled in the same way🤓 but yeaaa I still wanna get you chocolates all the timee because I'm a good boyfriend 😌😂" },
    { date: new Date(2026, 1, 10), name: "Teddy Day", emoji: "🧸", time: "9:20 AM", note: "Happy Teddy Day loveee 🧸😂 Teddies are meant to sit on the bed and look cute. Nuvvu kuda alane undu please, I'll come and do full \"aww\" mode 😌❤️" },
    { date: new Date(2026, 1, 11), name: "Promise Day", emoji: "🤝", time: "9:20 AM", note: "Happy promise day bangaramm🥹❤️, The first and the most important promise I want to make is to not make silly and fake promises to you and be real to myself about you💖" },
    { date: new Date(2026, 1, 12), name: "Hug Day", emoji: "🤗", time: "9:30 PM", note: "happyyy hug day ra bangarammm💖, there's no better feeling than falling into your arms and holding you tight ra🥹❤️. It heals all my sadness, feels secure to communicate what ever i feel. My most comfort place😭💝" },
    { date: new Date(2026, 1, 13), name: "Kiss Day", emoji: "💋", time: "9:20 AM", note: "Happy Kiss Day! 💋😘" },
    { date: new Date(2026, 1, 14), name: "Valentine's Day", emoji: "❤️", time: "9:20 AM", note: "Happy Valentine's Day my love! You mean everything to me ❤️💝" }
];

// ============== QUESTIONS ==============
const questions = [
    {
        text: "In which year did i first saw you and in which place we were there at that moment🤓 (answer these two with a space gap between them😁)",
        answer: "2022 railway station"
    },
    {
        text: "What was the first thing we shared with each other😼 (hint: It's a food item🙈)",
        answer: "maggie"
    }
];


let currentQuestion = 0;
let userName = '';
let soundEnabled = false;
let currentMusicInterval = null;
let audioContext = null;
let openedGifts = []; // Track which gifts have been opened
let currentAudio = null; // Track currently playing audio

// ============== AUDIO ELEMENTS ==============
const audioElements = {};

function initAudioElements() {
    audioElements.sirenita = document.getElementById('audioSirenita');
    audioElements.undertheSea = document.getElementById('audioUndertheSea');
    audioElements.serenity = document.getElementById('audioSerenity');
    audioElements.cricket = document.getElementById('audioCricket');
    audioElements.applause = document.getElementById('audioApplause');
    audioElements.padiPadi = document.getElementById('audioPadiPadi');
    audioElements.chipiChapa = document.getElementById('audioChipiChapa');
    audioElements.dearComrade = document.getElementById('audioDearComrade');
    
    // Set volumes
    Object.values(audioElements).forEach(audio => {
        if (audio) audio.volume = 0.5;
    });
}

// ============== AUDIO SYSTEM ==============
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    initAudioElements();
}

function stopAllAudio() {
    Object.values(audioElements).forEach(audio => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    currentAudio = null;
}

function stopCurrentMusic() {
    if (currentMusicInterval) {
        clearInterval(currentMusicInterval);
        currentMusicInterval = null;
    }
    stopAllAudio();
}

function playAudio(audioElement, loop = false) {
    if (!soundEnabled || !audioElement) return;
    stopAllAudio();
    audioElement.loop = loop;
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log('Audio play failed:', e));
    currentAudio = audioElement;
}

// Play a single note (for sound effects)
function playNote(freq, duration, volume = 0.1, type = 'sine', startTime = 0) {
    if (!soundEnabled || !audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    const now = audioContext.currentTime + startTime;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.linearRampToValueAtTime(volume * 0.7, now + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
}

// Play a chord (for sound effects)
function playChord(frequencies, duration, volume = 0.08) {
    frequencies.forEach(freq => {
        playNote(freq, duration, volume, 'sine');
    });
}

// ============== BACKGROUND MUSIC (MP3 FILES) ==============

// Name input screen - La Sirenita
function startNameInputMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.sirenita, true);
}

// Text intro until questions - Under the Sea
function startIntroMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.undertheSea, true);
}

// Question asking - Serenity (5-6 sec) then Cricket for answer time
function startQuestionMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.serenity, false);
    // After 5.5 seconds, switch to cricket for answer time
    setTimeout(() => {
        if (soundEnabled && currentAudio === audioElements.serenity) {
            playAudio(audioElements.cricket, true);
        }
    }, 5500);
}

// Cricket sound for waiting for answer
function startCricketMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.cricket, true);
}

// Love/Romantic - Padi Padi Leche (for yayyy it's rose day, love sections)
function startLoveMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.padiPadi, true);
}

// Celebration with applause (after both questions correct)
function startCelebrationMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.applause, false);
    // Play success sound effect too
    playSuccessSound();
}

// Dear Comrade music (after celebration, before rose day)
function startDearComradeMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.dearComrade, true);
}

// Short congratulatory sound after first question
function playFirstQuestionCorrectSound() {
    if (!soundEnabled || !audioContext) return;
    // Happy jingle
    playNote(523, 0.15, 0.15, 'sine', 0);      // C5
    playNote(659, 0.15, 0.15, 'sine', 0.15);   // E5
    playNote(784, 0.2, 0.15, 'sine', 0.3);     // G5
    playNote(1047, 0.3, 0.18, 'sine', 0.5);    // C6
}

// Gift reveal music - Chipi Chapa Cat
function startGiftMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.chipiChapa, false);
    // When chipi chapa ends, go back to love music
    audioElements.chipiChapa.onended = () => {
        if (soundEnabled) {
            startLoveMusic();
        }
    };
}

// Keep old function names for compatibility
function startFunnyMusic() {
    startIntroMusic();
}

// Pleasant ambient music - use padi padi for checkpoints view
function startPleasantMusic() {
    if (!soundEnabled) return;
    playAudio(audioElements.padiPadi, true);
}

// Sound effects
function playClickSound() {
    if (!soundEnabled || !audioContext) return;
    playNote(800, 0.08, 0.12, 'sine');
    setTimeout(() => playNote(600, 0.06, 0.08, 'sine'), 50);
}

function playSuccessSound() {
    if (!soundEnabled || !audioContext) return;
    playNote(523, 0.12, 0.12, 'sine', 0);
    playNote(659, 0.12, 0.12, 'sine', 0.12);
    playNote(784, 0.2, 0.12, 'sine', 0.24);
    playNote(1047, 0.3, 0.15, 'sine', 0.44);
}

function playErrorSound() {
    if (!soundEnabled || !audioContext) return;
    playNote(200, 0.15, 0.1, 'sawtooth', 0);
    playNote(150, 0.2, 0.1, 'sawtooth', 0.15);
}

function playTransitionSound() {
    if (!soundEnabled || !audioContext) return;
    playNote(300, 0.1, 0.08, 'sine', 0);
    playNote(450, 0.1, 0.08, 'sine', 0.08);
    playNote(600, 0.15, 0.08, 'sine', 0.16);
}

// Sound toggle button
const soundToggle = document.getElementById('soundToggle');
soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        initAudio();
        soundToggle.textContent = '🔊 Sound ON';
        soundToggle.classList.add('active');
        playClickSound();
        
        // Start appropriate music based on current section
        setTimeout(() => {
            const nameInputSection = document.getElementById('nameInput');
            if (nameInputSection && nameInputSection.classList.contains('active')) {
                startNameInputMusic(); // La Sirenita for name input
            } else {
                startPleasantMusic();
            }
        }, 300);
    } else {
        stopCurrentMusic();
        soundToggle.textContent = '🔇 Tap for Sound';
        soundToggle.classList.remove('active');
    }
});

// ============== DOM ELEMENTS ==============
const nameInputSection = document.getElementById('nameInput');
const catIntro = document.getElementById('catIntro');
const celebration = document.getElementById('celebration');
const valentineIntro = document.getElementById('valentineIntro');
const dayDisplay = document.getElementById('dayDisplay');
const checkpointView = document.getElementById('checkpointView');
const giftReveal = document.getElementById('giftReveal');
const noteReveal = document.getElementById('noteReveal');

const userNameInput = document.getElementById('userNameInput');
const nameSubmitBtn = document.getElementById('nameSubmitBtn');
const speechBubble = document.getElementById('speechBubble');
const catText = document.getElementById('catText');
const questionContainer = document.getElementById('questionContainer');
const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');
const giftTooltip = document.getElementById('giftTooltip');

// ============== USER STATE ==============
// Store state per user - each user has their own progress
function saveUserState() {
    // Get all users data
    const allUsers = JSON.parse(localStorage.getItem('valentineAllUsers') || '{}');
    
    // Save current user's state
    allUsers[userName.toLowerCase()] = {
        userName: userName,
        questionsCompleted: currentQuestion >= questions.length,
        openedGifts: openedGifts,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('valentineAllUsers', JSON.stringify(allUsers));
    // Also save last user for pre-filling name
    localStorage.setItem('valentineLastUser', userName);
}

function loadUserState(name = null) {
    const allUsers = JSON.parse(localStorage.getItem('valentineAllUsers') || '{}');
    const searchName = (name || userName || '').toLowerCase();
    
    if (searchName && allUsers[searchName]) {
        const userState = allUsers[searchName];
        userName = userState.userName || searchName;
        // Load this user's opened gifts
        if (userState.openedGifts && Array.isArray(userState.openedGifts)) {
            openedGifts = userState.openedGifts;
        } else {
            openedGifts = [];
        }
        return userState;
    }
    // New user - reset opened gifts
    openedGifts = [];
    return null;
}

function getLastUser() {
    return localStorage.getItem('valentineLastUser') || '';
}

// ============== CAT MEMES ==============
const catMemes = {
    asking: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXVjamRwN3M4bzZ6anU3NW4wbzhkZGh4eXR0MjBxZDJ3dW0yZms0dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/zOowlkUroZBoUb9sAl/giphy.gif",           // Cat asking - who are you (cute curious cat)
    lecturing: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y251dXEycXkydHZtajZsbGo3YjU5YXM3MWtzYzJ1MHE3dHM3YWc3aiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/CK5gKBdBXdGtVv6AfG/giphy.gif",        // Cat lecturing - lemme ask questions (cat typing/working)
    talking: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWFqaHZhd24xNjZsaXM4Z2lnbWJlbzNhMXl6ZzA2ZHdnaDh2YzJ3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MNoPXfXzOBrD8alZ9H/giphy.gif",          // Cat talking - during question (cat meowing)
    waiting: "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",          // Cat waiting - answer time (cat staring)
    happy: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2RmYXdmZjZvejA0b2ttZW5weGs4NzJwN3J6bHZhcDY2bDBnaWw0dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/T70hpBP1L0N7U0jtkq/giphy.gif",            // Happy cat
    excited: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2VlcWtnZzZxYzhlcngwcjExNThmdHhrZXljZ291ZGtsNHE0emRzdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/tyB0lfTtexrNK1lUoF/giphy.gif",      // Excited cat - celebrations
    love: "https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif",        // Love cat
    rose: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWNtaWtrdTFkeXVidzdrbTJmdHZxOGJpY2Z5ZHZrNG1uaXlxeDBhZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QsomqbDcRm9xMFxJMu/giphy.gif"         // Cat with rose/flower
};

function updateCatMeme(mood) {
    const catMemeImg = document.getElementById('catMemeImg');
    if (catMemeImg && catMemes[mood]) {
        catMemeImg.src = catMemes[mood];
    }
}

// ============== BOTTOM MEMES ==============
function updateBottomMeme(sectionId) {
    document.querySelectorAll('.bottom-meme').forEach(m => m.style.display = 'none');
    const memeElement = document.getElementById(sectionId + 'Meme');
    if (memeElement) {
        memeElement.style.display = 'flex';
    }
}

// ============== FLOATING HEARTS ==============
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const hearts = ['💕', '💖', '💗', '💝', '💘', '❤️', '💓', '💞'];
    
    for (let i = 0; i < 25; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.animationDuration = (8 + Math.random() * 6) + 's';
        heart.style.fontSize = (18 + Math.random() * 25) + 'px';
        container.appendChild(heart);
    }
}

// ============== TYPEWRITER ==============
function typeWriter(element, text, speed = 50, callback) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            setTimeout(callback, 800);
        }
    }
    type();
}

// ============== TEXT SLIDE ==============
function slideTextAnimation(text1El, text2El, text1, text2, callback) {
    typeWriter(text1El, text1, 35, () => {
        setTimeout(() => {
            text1El.classList.add('slide-up');
            setTimeout(() => {
                typeWriter(text2El, text2, 45, () => {
                    setTimeout(callback, 3000);
                });
            }, 500);
        }, 2000);
    });
}

// ============== SECTION TRANSITIONS ==============
function switchSection(from, to) {
    playTransitionSound();
    from.classList.add('fade-out');
    
    setTimeout(() => {
        from.classList.remove('active', 'fade-out');
        to.classList.add('active', 'fade-in');
        updateBottomMeme(to.id);
        
        setTimeout(() => {
            to.classList.remove('fade-in');
        }, 500);
    }, 500);
}

// ============== NAME INPUT ==============
function handleNameSubmit() {
    const name = userNameInput.value.trim();
    if (name.length < 1) {
        userNameInput.style.animation = 'shake 0.5s ease-in-out';
        playErrorSound();
        setTimeout(() => userNameInput.style.animation = '', 500);
        return;
    }
    
    userName = name;
    playClickSound();
    
    // Load state for THIS specific user (loads their opened gifts too)
    const savedState = loadUserState(name);
    
    if (savedState && savedState.questionsCompleted) {
        // This user already passed the questions, skip to checkpoints
        currentQuestion = questions.length;
        saveUserState();
        switchSection(nameInputSection, checkpointView);
        startPleasantMusic();
        setTimeout(showCheckpoints, 600);
    } else {
        // New user OR user who hasn't completed questions, go through full flow
        currentQuestion = 0;
        openedGifts = []; // Reset opened gifts for new user
        saveUserState();
        switchSection(nameInputSection, catIntro);
        startFunnyMusic();
        startCatIntro();
    }
}

nameSubmitBtn.addEventListener('click', handleNameSubmit);
userNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleNameSubmit();
});

// ============== CAT INTRO ==============
function startCatIntro() {
    startIntroMusic(); // Under the sea for intro text
    updateBottomMeme('catIntro');
    
    const catDialogue = [
        { text: "Who are you? 🤨", mood: "asking", delay: 2500 },
        { text: "Ummmm... lemme guess...", mood: "waiting", delay: 3000 },
        { text: "You're his girl, right? 😏", mood: "asking", delay: 3000 },
        { text: "Lemme ask a couple of questions to test you!! 😼", mood: "asking", delay: 3500 }
    ];
    
    let dialogueIndex = 0;
    
    function showNextDialogue() {
        if (dialogueIndex < catDialogue.length) {
            const dialogue = catDialogue[dialogueIndex];
            updateCatMeme(dialogue.mood);
            
            // Preload talking GIF before last dialogue ends
            if (dialogueIndex === catDialogue.length - 1) {
                const preloadImg = new Image();
                preloadImg.src = catMemes.talking;
            }
            
            typeWriter(catText, dialogue.text, 45, () => {
                dialogueIndex++;
                setTimeout(showNextDialogue, dialogue.delay);
            });
        } else {
            // Immediately update to talking before showing question
            updateCatMeme('talking');
            showQuestion();
        }
    }
    
    showNextDialogue();
}

// ============== QUESTIONS ==============
function showQuestion() {
    speechBubble.style.display = 'none';
    questionContainer.style.display = 'block';
    questionText.textContent = questions[currentQuestion].text;
    answerInput.value = '';
    answerInput.focus();
    errorMsg.textContent = '';
    
    // Show talking cat while question displays
    updateCatMeme('talking');
    startQuestionMusic(); // Serenity for 5-6 sec, then cricket
    
    // After serenity music ends, switch to waiting cat for answer time
    setTimeout(() => {
        updateCatMeme('waiting');
    }, 5500);
}

function checkAnswer() {
    const userAnswer = answerInput.value.toLowerCase().trim();
    let isCorrect = false;
    
    if (currentQuestion === 0) {
        // First question - answer is "sumith"
        if (userAnswer === questions[0].answer.toLowerCase()) {
            isCorrect = true;
        }
    } else if (currentQuestion === 1) {
        // Second question - answer is "white"
        if (userAnswer === questions[1].answer.toLowerCase()) {
            isCorrect = true;
        }
    }
    
    if (isCorrect) {
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            // First question correct - play applause for 2-3 seconds with happy meme
            updateCatMeme('happy');
            playAudio(audioElements.applause, false);
            errorMsg.style.color = '#4CAF50';
            errorMsg.textContent = "Correct! 🎉 Here's the next one...";
            
            // After 2.5 seconds, show next question with talking meme
            setTimeout(() => {
                errorMsg.style.color = '#ff4757';
                errorMsg.textContent = '';
                showQuestion(); // This will set talking meme
            }, 2500);
        } else {
            // Both questions correct! Save state and celebrate
            playSuccessSound();
            saveUserState();
            startCelebrationMusic(); // Applause!
            showCelebration();
        }
    } else {
        updateCatMeme('asking'); // Show asking/curious cat for wrong answer
        playErrorSound();
        startCricketMusic(); // Cricket sound for wrong answer
        errorMsg.textContent = "Hmm... that's not right. Try again! 😾";
        answerInput.value = '';
        answerInput.focus();
        
        questionContainer.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => questionContainer.style.animation = '', 500);
    }
}

submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

// ============== CELEBRATION ==============
function showCelebration() {
    startCelebrationMusic();
    switchSection(catIntro, celebration);
    
    setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }), 500);
    setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } });
    }, 1200);
    setTimeout(() => {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    }, 2000);
    
    const celebText = document.getElementById('celebrationText');
    setTimeout(() => {
        typeWriter(celebText, "Get in my queen, take this crown 👑, it fits you perfectly!!!", 35, () => {
            setTimeout(showValentineIntro, 4000);
        });
    }, 1500);
}

// ============== VALENTINE INTRO ==============
function showValentineIntro() {
    startDearComradeMusic(); // Dear Comrade after celebration until rose day
    switchSection(celebration, valentineIntro);
    
    const introText1 = document.getElementById('introText1');
    const introText2 = document.getElementById('introText2');
    
    setTimeout(() => {
        slideTextAnimation(
            introText1,
            introText2,
            "Guess what? This valentine's week, your boii gonna get something special on each day of the week 💝",
            "Ayithe chusedhamaaaaaa 😜",
            showDayDisplay
        );
    }, 1000);
}

// ============== DAY INFO ==============
function getCurrentDayInfo() {
    const today = getCurrentDate();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < valentineDays.length; i++) {
        const dayDate = new Date(valentineDays[i].date);
        dayDate.setHours(0, 0, 0, 0);
        
        if (today.getTime() === dayDate.getTime()) {
            return { index: i, ...valentineDays[i], status: 'current' };
        }
    }
    
    const firstDay = new Date(valentineDays[0].date);
    const lastDay = new Date(valentineDays[valentineDays.length - 1].date);
    
    if (today < firstDay) return { index: 0, ...valentineDays[0], status: 'upcoming' };
    if (today > lastDay) return { index: valentineDays.length - 1, ...valentineDays[valentineDays.length - 1], status: 'passed' };
    
    for (let i = 0; i < valentineDays.length - 1; i++) {
        const currentDate = new Date(valentineDays[i].date);
        const nextDate = new Date(valentineDays[i + 1].date);
        if (today >= currentDate && today < nextDate) {
            return { index: i, ...valentineDays[i], status: 'current' };
        }
    }
    
    return { index: 0, ...valentineDays[0], status: 'current' };
}

// ============== DAY DISPLAY ==============
function showDayDisplay() {
    startLoveMusic(); // Padi Padi for yayyy it's rose day
    switchSection(valentineIntro, dayDisplay);
    
    const dayInfo = getCurrentDayInfo();
    const dayText = document.getElementById('dayText');
    
    setTimeout(() => {
        dayText.textContent = `Yayyyyyyy it's ${dayInfo.name}yyyyyyyy 🥳`;
        dayText.style.animation = 'slideIn 1s ease-out';
        
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff6b9d', '#ffb6c8', '#ffd700', '#ff9eb5', '#a18cd1']
        });
        
        setTimeout(showCheckpoints, 6000);
    }, 1000);
}

// ============== CHECKPOINTS ==============
function showCheckpoints() {
    startPleasantMusic();
    
    if (!checkpointView.classList.contains('active')) {
        switchSection(dayDisplay, checkpointView);
    }
    
    const container = document.getElementById('checkpointContainer');
    container.innerHTML = '';
    
    const today = getCurrentDate();
    today.setHours(0, 0, 0, 0);
    
    valentineDays.forEach((day, index) => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        
        // Check if this gift has been opened
        const isOpened = openedGifts.includes(day.name);
        
        let status = 'future';
        if (today > dayDate) {
            // Past day - always completed
            status = 'completed';
        } else if (today.getTime() === dayDate.getTime()) {
            // Today - check if already opened
            status = isOpened ? 'completed' : 'current';
        }
        // Future days remain 'future'
        
        const checkpoint = document.createElement('div');
        checkpoint.className = `checkpoint ${status}`;
        checkpoint.innerHTML = `
            <div class="gift-icon">
                <div class="gift-bow"></div>
                <div class="gift-lid"></div>
                <div class="gift-box"></div>
            </div>
            <span class="checkpoint-label">${day.emoji} ${day.name}</span>
            <span class="checkpoint-date">Feb ${day.date.getDate()}</span>
        `;
        
        checkpoint.addEventListener('click', (e) => {
            playClickSound();
            if (status === 'current') {
                showGiftReveal(day);
            } else if (status === 'completed') {
                showTooltip(e, "Already open chesav donga 😂");
            } else if (status === 'future') {
                showTooltip(e, "Inka time undhi baby wait cheyyy 🙈");
            }
        });
        
        container.appendChild(checkpoint);
    });
}

// ============== TOOLTIP ==============
function showTooltip(event, message) {
    giftTooltip.textContent = message;
    giftTooltip.classList.add('show');
    
    const rect = event.target.closest('.checkpoint').getBoundingClientRect();
    giftTooltip.style.left = rect.left + rect.width/2 - giftTooltip.offsetWidth/2 + 'px';
    giftTooltip.style.top = rect.top - giftTooltip.offsetHeight - 15 + 'px';
    
    setTimeout(() => giftTooltip.classList.remove('show'), 2500);
}

// ============== GIFT REVEAL ==============
let currentGiftDay = null; // Store current day for note reveal

function showGiftReveal(day) {
    currentGiftDay = day; // Save the day for note reveal
    
    // Mark this gift as opened
    if (!openedGifts.includes(day.name)) {
        openedGifts.push(day.name);
        saveUserState();
    }
    
    startGiftMusic();
    switchSection(checkpointView, giftReveal);
    
    const giftText1 = document.getElementById('giftText1');
    const giftText2 = document.getElementById('giftText2');
    
    giftText1.textContent = '';
    giftText2.textContent = '';
    giftText1.classList.remove('slide-up');
    
    confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff6b9d', '#ffb6c8', '#ffd700', '#ff9eb5', '#a18cd1', '#667eea']
    });
    
    setTimeout(() => {
        const giftTime = currentGiftDay && currentGiftDay.time ? currentGiftDay.time : "9:20 AM";
        slideTextAnimation(
            giftText1,
            giftText2,
            "Yayyyyyyy neekosam thechina gift ippudu ni sonthammmmmm 🎁",
            `The gift will be at your door sharp at ${giftTime} 🥳`,
            showNoteReveal
        );
    }, 1000);
}

// ============== NOTE REVEAL ==============
function showNoteReveal() {
    startLoveMusic();
    switchSection(giftReveal, noteReveal);
    
    const noteIntroText = document.getElementById('noteIntroText');
    const noteText = document.getElementById('noteText');
    
    // Update note text based on current day
    if (currentGiftDay && currentGiftDay.note) {
        noteText.textContent = currentGiftDay.note;
    }
    
    setTimeout(() => {
        typeWriter(noteIntroText, "He got a note for youuuuu 💌", 45);
    }, 500);
}

// Back button
document.getElementById('backBtn').addEventListener('click', () => {
    playClickSound();
    switchSection(noteReveal, checkpointView);
    startPleasantMusic();
    // Refresh checkpoints to show updated state
    setTimeout(() => showCheckpoints(), 100);
    setTimeout(showCheckpoints, 100);
});

// ============== INIT ==============
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    
    // Always start from first screen on reload
    // Pre-fill with last user's name for convenience
    const lastUser = getLastUser();
    if (lastUser) {
        userNameInput.value = lastUser;
    }
    
    updateBottomMeme('nameInput');
});

// Update checkpoints periodically
setInterval(() => {
    if (checkpointView.classList.contains('active')) {
        showCheckpoints();
    }
}, 60000);
