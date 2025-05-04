let currentSong = new Audio;
let currentSongIndex = 0;     
let allSongs = [];   
let currFolder;      

function secondsToMinutes(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "0:00";
    }
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        let songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                const encodedName = element.href.split(`${folder}`)[1];
                const displayName = encodedName.replace(/%20/g ," ").replace(".mp3", "") || encodedName;
                songs.push({
                    encodedName,
                    displayName: displayName.replace(/%2C/g," ").split("BNCS")[0].replace("/","").replace("%5"," ").replace("-320kbps","").replace("128-","").replace("%E2%80%98"," ")
                });
            }
        }
        return songs;
    } catch (err) {
        console.error("Error:", err);
        return [];
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}` + track;
    if (!pause) {
        currentSong.play().catch(e => console.error("Playback failed:", e));
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20"," ").replace(/%2C/g," ").split("BNCS")[0].replace("/","").replace("%5"," ").replace("-320kbps","").replace(".mp3", "").replace("128-","").replace("%E2%80%98"," ") || track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    play.src = "play.svg";

    // show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // clear old list

    for (const song of allSongs) {
        songUl.innerHTML += `<li data-filename="${song.encodedName}">
            <img src="music.svg" alt="">
            <div class="info">
                <div>${song.displayName}</div>
                <div>NCS</div>
            </div>
            <div class="playnow flex">
                <div>Play Now</div>
                <img src="play.svg" alt="">
            </div>
        </li>`;
    }

    // attach event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            const filename = e.getAttribute("data-filename");
            currentSongIndex = index;  
            playMusic(filename);
            play.src = "pause.svg";
        });
    });
}

async function dislayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".songsContainer1")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if(e.href.includes("/songs/")){
            let folder = e.href.split("songs/")[1]
            //get the metadata info of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)     
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="songsContainer1">
                    <div data-folder="${folder}" class="songs ">
                      <div  class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="12" fill="green" />
                          <polygon points="9,7 9,17 17,12" fill="black" />
                        </svg>  
                      </div>
                      <img src="/songs/${folder}/cover.jpg">
                      <h3>${response.title}</h3>
                      <p>${response.description}</p>
                    </div>
                   
                  </div>`
        }
    }
     // Song cards (folder switch)
     Array.from(document.getElementsByClassName("songs")).forEach(e => {
        e.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            allSongs = await getSongs(`songs/${folderName}`);
            if (allSongs.length > 0) {
                currentSongIndex = 0;
                playMusic(allSongs[0].encodedName, true);
            }
        });
    });


     // add an event listener to mute the current song 
     document.querySelector(".volume>img").addEventListener("click",(e)=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .25
            document.querySelector(".range").getElementsByTagName("input")[0].value=25       
            }
        })

}

async function main() {
    const play = document.getElementById("play");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    
    allSongs = await getSongs("songs/CS");
    
    // Automatically load the first song
    if (allSongs.length > 0) {
        currentSongIndex = 0;
        playMusic(allSongs[0].encodedName, true);
    }
    
    //display all the albums on the page
    dislayAlbums()
    
    // Play / Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });
    
    // Previous button
    prev.addEventListener("click", () => {
        if (allSongs.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
        playMusic(allSongs[currentSongIndex].encodedName);
        play.src = "pause.svg";
    });
    
    // Next button
    next.addEventListener("click", () => {
        if (allSongs.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % allSongs.length;
        playMusic(allSongs[currentSongIndex].encodedName);
        play.src = "pause.svg";
    });
    
    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentSong.currentTime)} : ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if(currentSong.currentTime == currentSong.duration){
            play.src = "play.svg";
        }
    });
    
    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let setLimit = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = setLimit + "%";
        currentSong.currentTime = ((currentSong.duration) * setLimit) / 100;
    });
    
    // Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    
    // Close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%";
    });
    
    // Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        
    });

   

    
    
}

   
main();
