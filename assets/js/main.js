let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds;
    }
    
    return minutes + ":" + remainingSeconds;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/${currFolder}`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
                            <img class="invert" src="assets/photos/music.svg" alt="music">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replaceAll("%C3%", "")}</div>
                            </div>
                            <div class="playnow">
                                <span>Playnow</span>
                                <img class="invert" src="assets/photos/playnow.svg" alt="play">
                            </div>
                        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener('click', () => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = (`/${currFolder}/` + track);
    if (!pause) {
        currentSong.play();
        play.src = "assets/photos/pause.png";
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00';
}

async function displayalbum() {
    let response = await fetch(`http://127.0.0.1:5500/songs/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    
    // Select the correct container for cards
    let cardContainer = document.querySelector('.cardContainer');
    
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            try {
                let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                if (res.ok) {
                    let data = await res.json();
                    console.log(data);
                    cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <img src="assets/photos/play_in_circle_green.png" alt="playa">
                        </div>
                        <img src="/songs/${folder}/cover.png" alt="img">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                    </div>`;
                }
            } catch (err) {
                console.error(`info.json not found in /songs/${folder}`);
            }
        }
    }   
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
};


async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    
    await displayalbum();
    
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/photos/pause.png";
        } else {
            currentSong.pause();
            play.src = "assets/photos/play.png";
        }
    });

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    });

    document.querySelector('.seekbar').addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left-column').style.left = '0';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left-column').style.left = '-120%';
    });

    previous.addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener('click', () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index + 1) <= songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.getElementById("rangevolume").addEventListener('change', e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector('.volume>img').addEventListener('click',e => {
        console.log(e.target)
        if (e.target.src.includes('volume.png')){
            e.target.src = e.target.src.replace('volume.png','mute.svg');
            currentSong.volume = 0;
        }
        else{
            e.target.src = e.target.src.replace('mute.svg','volume.png');
            currentSong.volume = .1;
        }
    })
    
}

main();
