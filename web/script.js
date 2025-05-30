const { ref, onMounted, onUnmounted, watch, computed } = Vue;

export default {
    setup() {
        const config = ref({
            dark: true, // true for dark overlays, false for light overlays (Buttons)
            textColor: `rgba(252,43,43,0.8)`,
            theme: [252,43,43], // R, G, B Values
            background: {
                image: false, // directory / false
                video: 'assets/bg.mp4', // or false | Note: image must be set to false for this to work
            },
            logo: 'assets/logo.png', // Directory / false
            logoSize: '15vw', // This is basically the width of the logo / height is auto
            play: true, // [true] Play on default | [false] Don't play
            muted: false, // [true] Muted on default | [false] Not Muted
            volume: 25, // Default Volume (10-100)
            current: 0, // DO NOT TOUCH
            list: [ // Add more
                {
                    title: "Big Dawgs",
                    author: "Hanumankind",
                    music: "assets/music/bigdawgs.mp3",
                    image: "assets/music/bigdawgs.png",
                },
                {
                    title: "Mercury",
                    author: "Ghostemane",
                    music: "assets/music/mercury.mp3",
                    image: "assets/music/mercury.png",
                },
            ],
        });

        const cursorX = ref(0);
        const cursorY = ref(0);
        const progress = ref(0);
        const audio = ref(new Audio());

        const buttonColor =  computed(()=>{
            if (config.value.dark) {
                return {
                    '--button-background': `rgba(0,0,0,0.3)`,
                    '--button-background-hover': `rgba(0,0,0,0.5)`,
                    '--button-background-active': `rgba(0,0,0,0.6)`,
                }
            } else {
                return {
                    '--button-background': `rgba(255,255,255,0.05)`,
                    '--button-background-hover': `rgba(255,255,255,0.1)`,
                    '--button-background-active': `rgba(255,255,255,0.15)`,
                }
            }
        })

        function updateCursor(e) {
            cursorX.value = e.pageX;
            cursorY.value = e.pageY;
        }

        function toggleMusic() {
            config.value.play = !config.value.play;
        }

        function nextMusic() {
            config.value.current = (config.value.current + 1) % config.value.list.length;
        }

        function prevMusic() {
            config.value.current =
                (config.value.current - 1 + config.value.list.length) % config.value.list.length;
        }

        onMounted(() => {
            document.addEventListener('mousemove', updateCursor);
            document.addEventListener('keydown', (event) => {
                if (event.code === 'Space') {
                event.preventDefault();
                toggleMusic();
                }
            });

            const randomIndex = Math.floor(Math.random() * config.value.list.length);
            config.value.current = randomIndex;

            const currentTrack = config.value.list[randomIndex];
            audio.value.src = currentTrack.music;
            audio.value.volume = config.value.volume / 100;
            audio.value.muted = config.value.muted;
            audio.value.play();
        });

        onUnmounted(() => {
            document.removeEventListener('mousemove', updateCursor);
            document.removeEventListener('keydown', toggleMusic);
        });

        window.addEventListener('message', function (e) {
            if (e.data.eventName === 'loadProgress') {
                progress.value = (e.data.loadFraction * 100).toFixed(0);
            }
        });

        watch(() => config.value.play, (newVal) => {
            if (newVal) {
                audio.value.play();
            } else {
                audio.value.pause();
            }
        });

        watch(() => config.value.volume, (newVal) => {
            audio.value.volume = newVal / 100;
            config.value.muted = newVal === 0;
        });

        watch(() => config.value.muted, (newVal) => {
            audio.value.muted = newVal;
        });

        watch(() => config.value.current, (newIndex) => {
            const currentTrack = config.value.list[newIndex];
            audio.value.src = currentTrack.music;
            if (config.value.play) {
                audio.value.play();
            }
        });

        return {
            cursorX,
            cursorY,
            progress,
            config,
            buttonColor,
            toggleMusic,
            nextMusic,
            prevMusic,
        };
    },
};
