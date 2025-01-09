console.log('Fetching song list...');
let currentSong = new Audio();
let songs;
let currFolder;
console.log();



// display time
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// =========================================================================================================

// get the Floders 
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

// =========================================================================================================
    // get the song
    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songsUL.innerHTML = ""; 
    for (const song of songs) {
        const listItem = document.createElement("li");
        listItem.classList.add("playimg");
        listItem.innerHTML = `
            <img class="invert music" src="music.svg" alt="">
            <div class="info infoname">
                
             <div class="songname" >${song.replaceAll("%20", " ")}</div>

            </div>
            
            <div class="gifContainer invert1"></div>
        `;
        songsUL.appendChild(listItem);
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

// =========================================================================================================

//gif 
const playMusic = (track, pause = false) => {
  
    document.querySelectorAll(".gifContainer").forEach(container => {
        container.innerHTML = ""; 
    });

    currentSong.src = `/${currFolder}/` + track;


    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";

        const currentSongElement = Array.from(document.querySelectorAll(".songname")).find(
            element => element.textContent.trim() === track
        );
        if (currentSongElement) {
            const gifContainer = currentSongElement.closest(".playimg").querySelector(".gifContainer");
            const gif = document.createElement("img");
            gif.src = "Equalizer/Equalizer.gif";
            gif.width = 70;
            gifContainer.innerHTML = ""; 
            gifContainer.appendChild(gif);
        }
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};



//==========================================================================================================


// display album
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
        }
    });
}

//=========================================================================================================

// pause
async function main() {
    await getSongs("songs/GLORY");
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });


        // previous
        previous.addEventListener("click", () => {
            currentSong.pause();
            console.log("Previous clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });
    
        // next
        next.addEventListener("click", () => {
            currentSong.pause();
            console.log("Next clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });

// =========================================================================================================

    // cirlce 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    // seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });


    // close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });


//=========================================================================================================


    // volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
//=========================================================================================================


}

main();
