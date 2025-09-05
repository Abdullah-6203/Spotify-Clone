//As we are not using any backend, we get the songs like this
//Ideally, we get all the songs from the server using APIs
//Currently, this is good for learning purpose

let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function getsongs(folder){
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    
    songs = []; // Reset songs array for new folder
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            // Extract filename from the full URL
            let filename = element.href.split('/').pop();
            
            // Filter out Mac system files
            if (!filename.startsWith('._') && 
                filename !== '.DS_Store' &&
                !filename.includes('__MACOSX')) {
                // Store the COMPLETE filename, not just part of it
                songs.push(filename); // Keep the full filename with .mp3
            }
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = "" //Clear the list first
    
    // Store the complete filename and create display name
    for (const song of songs) {
        // Create a clean display name
        let displayName = song
            .replace('.mp3', '') // Remove .mp3 extension
            .replaceAll('%20', ' ') // Replace %20 with spaces
            .replaceAll('%20-%20', ' - '); // Replace encoded dashes
        
        songUL.innerHTML = songUL.innerHTML + `<li data-song="${song}">
                             <img src="img/music.svg" alt="">
                            <div class="list-info">
                               <div>${displayName}</div>
                               <div>ABDULLAH</div>
                            </div>
                            <div class="playnow">
                              <span>Play</span>
                              <img src="img/play.svg" alt="">
                            </div>
                        </li>`
    }
    
    //attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // Get the exact filename from data attribute
            let filename = e.getAttribute("data-song");
            console.log("Playing song:", filename);
            playMusic(filename); // Pass the complete filename
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // Don't add .mp3 again since it's already in the filename
    currentsong.src = `/${currfolder}/` + track;
    if(!pause){
        currentsong.play()
        document.getElementById("play").src = "img/pause.svg"
    }
   
    // Update song info display
    let displayName = track
        .replace('.mp3', '')
        .replaceAll('%20', ' ')
        .replaceAll('%20-%20', ' - ');
    
    document.querySelector(".songinfo").innerHTML = displayName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function DisplayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let Anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    
    // Clear existing cards first
    cardcontainer.innerHTML = ""
    
    let array = Array.from(Anchors)
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        // More strict filtering - only include actual folder directories
        if(e.href.includes("/songs/") && 
           !e.href.endsWith("/songs/") && 
           !e.href.includes("..") &&
           e.href.endsWith("/")) { // Only directories end with /
            
            let folder = e.href.split("/").slice(-2)[0]
            
            // Skip common non-album folders
            if (folder === "" || 
                folder === "." || 
                folder === ".." ||
                folder.startsWith(".")) {
                continue;
            }
            
            console.log("Found album folder:", folder); // Debug log
            
            // Try to get metadata, but handle if info.json doesn't exist
            let title = folder;
            let description = "Album";
            
            try {
                let metaResponse = await fetch(`/songs/${folder}/info.json`);
                if (metaResponse.ok) {
                    let metadata = await metaResponse.json();
                    title = metadata.title || folder;
                    description = metadata.description || "Album";
                }
            } catch (error) {
                console.log(`No info.json found for ${folder}, using default values`);
            }
            
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
                      <div class="card-playbutton">
                        <svg width="40" height="40" fill="white" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 408.221 408.221" xml:space="preserve" stroke="#1DB954">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier"><g> 
                            <g> 
                            <path d="M204.11,0C91.388,0,0,91.388,0,204.111c0,112.725,91.388,204.11,204.11,204.11c112.729,0,204.11-91.385,204.11-204.11 C408.221,91.388,316.839,0,204.11,0z M286.547,229.971l-126.368,72.471c-17.003,9.75-30.781,1.763-30.781-17.834V140.012 c0-19.602,13.777-27.575,30.781-17.827l126.368,72.466C303.551,204.403,303.551,220.217,286.547,229.971z"></path> 
                            </g> 
                            </g> 
                            </g>
                        </svg>
                      </div>  
                        <img src="/songs/${folder}/cover.jpg" alt="" onerror="this.src='img/default-album.png'">
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </div>`
        }
    }
    
    //Loading Playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Card clicked:", item.currentTarget.dataset.folder);
            let newSongs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            if (newSongs && newSongs.length > 0) {
                songs = newSongs; // Update the global songs array
                console.log("New songs loaded:", songs);
                playMusic(songs[0], false);
            }
        })
    });
}

async function main(){
    //Get list of songs
    songs = await getsongs(`songs/Fav-Songs`)
    console.log("All songs:", songs) // Debug: see actual filenames
    playMusic(songs[0], true)
    
    //Display All the Albums on the Page
    DisplayAlbums()

    //Attach an event listener to the play,next and previous button
    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused){
            currentsong.play();
            document.getElementById("play").src = "img/pause.svg";
        }else{
            currentsong.pause();
            document.getElementById("play").src = "img/play-playbar.svg";
        }
    });

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = formatTime(currentsong.currentTime) + " / " + formatTime(currentsong.duration)
        document.querySelector(".circle").style.left = ((currentsong.currentTime/currentsong.duration)*100) + "%"
    })

    //Add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.clientWidth;
        currentsong.currentTime = percent * currentsong.duration;
    })

    //add eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add eventlistener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Adding functionality to previous button
    document.getElementById("previous").addEventListener("click", () => {
        let filename = currentsong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(filename);
        console.log("Previous - Current index:", index, "Filename:", filename);
        
        if (index > 0) { 
            playMusic(songs[index - 1]);
            console.log("Playing previous:", songs[index - 1]);
        } else {
            console.log("Already at first song");
        }
    });
    
    //Adding functionality to next button
    document.getElementById("Next").addEventListener("click", () => {
        let filename = currentsong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(filename);
        console.log("Next - Current index:", index, "Filename:", filename);
        
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
            console.log("Playing next:", songs[index + 1]);
        } else {
            console.log("Already at last song");
        }
    });

    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume == 0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg"
        }
        if (currentsong.volume > 0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg"
        }
    });
    
    //Add event listener for mute
    document.querySelector(".vol-img").addEventListener("click", (e) => {
        if (currentsong.volume != 0){
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }else{
            currentsong.volume = 1;
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100
        }
    });
}

main()