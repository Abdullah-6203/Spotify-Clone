// ================================
// Spotify Clone JS - Netlify Ready
// ================================

// Current song object
let currentsong = new Audio();
let songs = [];
let currfolder = "";

// ------------------------------
// Utility: Format seconds to mm:ss
// ------------------------------
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// ------------------------------
// Load songs into sidebar
// ------------------------------
async function getsongs(folder) {
    currfolder = folder;

    // Fetch playlist JSON
    const response = await fetch(`/songs/${folder}/info.json`);
    const data = await response.json();
    songs = data.songs;

    // Populate sidebar
    const songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        const displayName = song.replace('.mp3','').replaceAll('%20',' ').replaceAll('%20-%20',' - ');
        songUL.innerHTML += `
            <li data-song="${song}">
                <img src="img/music.svg" alt="">
                <div class="list-info">
                    <div>${displayName}</div>
                    <div>ABDULLAH</div>
                </div>
                <div class="playnow">
                    <span>Play</span>
                    <img src="img/play.svg" alt="">
                </div>
            </li>
        `;
    });

    // Add click listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            const filename = li.getAttribute("data-song");
            playMusic(filename, false);
        });
    });

    return songs;
}

// ------------------------------
// Play Music
// ------------------------------
function playMusic(filename, pause = false) {
    if (!filename) return;

    currentsong.src = `/songs/${currfolder}/${filename}`;

    // Error handling
    currentsong.onerror = () => {
        console.error("Failed to load audio:", currentsong.src);
        alert(`Cannot play ${filename}`);
    };

    document.querySelector(".songinfo").innerHTML = filename
        .replace('.mp3','').replaceAll('%20',' ').replaceAll('%20-%20',' - ');

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    if (!pause) {
        currentsong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
}

// ------------------------------
// Display Playlist Albums
// ------------------------------
// ------------------------------
// Display Playlist Albums
// ------------------------------
async function DisplayAlbums() {
    // Playlist folder names
    const playlists = [
        "Fav-Songs",
        "Qawwali",
        "Punjabi Songs",
        "Party-Songs",
        "Old-Songs"
    ];
    const cardcontainer = document.querySelector(".cardcontainer");

    for (const folder of playlists) {
        const response = await fetch(`/songs/${folder}/info.json`);
        const data = await response.json();

        // Use the JSON data for title & description if available
        const title = data.title || folder; 
        const description = data.description || "Playlist";

        cardcontainer.innerHTML += `
            <div data-folder="${folder}" class="card rounded">
                <div class="card-playbutton">
                    <svg width="40" height="40" fill="white" viewBox="0 0 408.221 408.221" stroke="#1DB954">
                        <path d="M204.11,0C91.388,0,0,91.388,0,204.111c0,112.725,91.388,204.11,204.11,204.11c112.729,0,204.11-91.385,204.11-204.11C408.221,91.388,316.839,0,204.11,0z M286.547,229.971l-126.368,72.471c-17.003,9.75-30.781,1.763-30.781-17.834V140.012c0-19.602,13.777-27.575,30.781-17.827l126.368,72.466C303.551,204.403,303.551,220.217,286.547,229.971z"></path>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="" onerror="this.src='img/default-album.png'">
                <h2>${title}</h2>
                <p>${description}</p>
            </div>
        `;
    }

    // Click to load playlist
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getsongs(card.dataset.folder);
            currfolder = card.dataset.folder;
            playMusic(songs[0], false);
        });
    });
}


// ------------------------------
// Main function
// ------------------------------
async function main() {
    // Load default playlist
    await getsongs("Fav-Songs");
    currfolder = "Fav-Songs";
    playMusic(songs[0], true);

    // Display all albums
    await DisplayAlbums();

    // Play/Pause button
    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentsong.pause();
            document.getElementById("play").src = "img/play-playbar.svg";
        }
    });

    // Previous button
    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index > 0) playMusic(songs[index-1]);
    });

    // Next button
    document.getElementById("Next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index < songs.length-1) playMusic(songs[index+1]);
    });

    // Update seekbar
    currentsong.addEventListener("timeupdate", () => {
        const current = formatTime(currentsong.currentTime);
        const duration = formatTime(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${current} / ${duration}`;
        document.querySelector(".circle").style.left = ((currentsong.currentTime / currentsong.duration) * 100) + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const percent = e.offsetX / e.target.clientWidth;
        currentsong.currentTime = percent * currentsong.duration;
    });

    // Volume control
    const volumeInput = document.querySelector(".range input");
    volumeInput.addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value)/100;
        document.querySelector(".vol-img").src = currentsong.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    // Mute toggle
    document.querySelector(".vol-img").addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.volume = 0;
            volumeInput.value = 0;
            document.querySelector(".vol-img").src = "img/mute.svg";
        } else {
            currentsong.volume = 1;
            volumeInput.value = 100;
            document.querySelector(".vol-img").src = "img/volume.svg";
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close menu
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

// Run main
main();
