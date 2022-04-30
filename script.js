/*
const IMG_CHECKED = 'images/checked.png';
const IMG_UNCHECKED = 'images/unchecked.png';
*/
const API_KEY_GOOGLE = 'AIzaSyA18CoxcFIRxukRKRhyLQentY99KGJOnEQ';
const URL_VIDEO_YOUTUBE = 'https://www.youtube.com/watch?v=';
const URL_API_TODO = 'https://api.todoist.com/rest/v1/projects';
const URL_AUTH_TODO = 'https://todoist.com/oauth/access_token';
const TODO_CLIENT_ID = 'ef23d98f84c74251892f571d2269bd1a';
const TODO_CLIENT_SECRET = 'baf733ce1640426c8307a8fca14513b7';
const TODO_CODE = '82f1232ce332f1d708f2ea5bc4b6f1bebe76a88f';

/* esempio: https://todoist.com/oauth/authorize?client_id=0123456789abcdef&scope=data:read,data:delete&state=secretstring */

function showOverlay() {
    const layerOverlay = document.querySelector('#overlay');
    let noResults;
    document.body.classList.add('no-scroll');
    layerOverlay.style.top = window.pageYOffset + 'px';
    layerOverlay.classList.remove('hidden');
}
function insertMap(object) {
    const lat = object.dataset.jobLat;
    const long = object.dataset.jobLong;
    const restUrl = 'https://www.google.com/maps/embed/v1/view?key=' + API_KEY_GOOGLE + '&center=' + lat + ',' + long + '&zoom=18&maptype=satellite';  

    const overlayContent = document.querySelector('#overlay .content');
    const iframe = document.createElement('iframe');
    iframe.src = restUrl;
    iframe.referrerPolicy = 'no-referrer-when-downgrade'
    iframe.frameBorder = '0'
    overlayContent.append(iframe);
    showOverlay();
}

function readVideos(response) {
    const overlayContent = document.querySelector('#overlay .content');
    for (const video of response.items){
        const div = document.createElement('div');
        const image = document.createElement('img');
        const link = document.createElement('a');
        div.classList.add('previewVideo');
        image.src = video.snippet.thumbnails.default.url;
        link.href = URL_VIDEO_YOUTUBE + video.id.videoId;
        link.textContent = video.snippet.title;
        div.append(image);
        div.append(link);
        overlayContent.append(div);
    }
    console.log('Video: ' + response)
    if (response.items.length > 0) {
        showOverlay();
    } else {
        console.log('Nessun video trovato!');
    }
}

function onVideoResponse(response) {
/*console.log('Risposta: ' + test);*/
    response.json().then(readVideos);
}

function onVideoError(response) {
    console.log('Errore: ' + response);
}

function insertVideo(object) {
    const keywords = encodeURIComponent(object.dataset.jobKeywords);
    const restUrl = 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=' + keywords + '&type=video&key=' + API_KEY_GOOGLE;
    
    fetch(restUrl).then(onVideoResponse, onVideoError);
}

function openOverlay(event) {
    if (event.currentTarget.className==='job-thumbnail') {
        insertMap(event.currentTarget);
    }
    else {
        insertVideo(event.currentTarget);
    }
    event.stopPropagation();
}

/* alla prima esecuzione definisco il click dei thumbnail di posizione */
const jobThumbnails = document.querySelectorAll('.job .job-thumbnail');
for (const jobThumbnail of jobThumbnails) {
    jobThumbnail.addEventListener('click', openOverlay);
}

/* alla prima esecuzione definisco il click dei thumbnail di posizione */
const jobIntro = document.querySelectorAll('.job .job-intro');
for (const job of jobIntro) {
    if (job.dataset.jobVideo === 'yes') {
        job.addEventListener('click', openOverlay);
    }
}



/* Funzionamento pulsante chiusura overlay */
function closeOverlay(event) {
    const layerOverlay = document.querySelector('#overlay');
    const overlayContent = document.querySelector('#overlay .content');
    overlayContent.innerHTML = '';
    document.body.classList.remove('no-scroll');
    layerOverlay.classList.add('hidden');
    event.stopPropagation();
}
const btnCloseOverlay = document.querySelector('#overlay .close');
btnCloseOverlay.addEventListener('click', closeOverlay);

function onToDoJson(projects) {
    const sectionTodo = document.querySelector('#job-ToDo');
    for (const project of projects) {
        if (project.name !== 'Inbox') {
            const div = document.createElement('div');
            const link = document.createElement('a');
            div.classList.add('newJob');
            link.href = project.url;
            link.textContent = project.name;
            div.append(link);
            sectionTodo.append(div);
        }
    }
    if (projects.length > 1) {
        document.querySelector('#ToDo').classList.remove('hidden');
    }
}

function onToDoResponse(response) {
    let test = response.json();
    test.then(onToDoJson);
}

function onToDoError(response) {
    console.log('Errore: ' + response.text());
}

fetch(URL_API_TODO,
    {
        headers: {
            'Authorization': 'Bearer ' + TODO_CODE
        }
    }).then(onToDoResponse, onToDoError);
