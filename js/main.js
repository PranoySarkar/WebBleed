window.addEventListener('load', main)

function main() {

    vaildateCacheIfOnline()
        .then(_ => {


            document.querySelector(`#navLinkUl`).addEventListener('click', (event) => {
                let ot = event.target;
                if (ot.classList.contains(`navLinkBtn`)) {
                    document.querySelectorAll('.component').forEach(e => e.style.display = 'none')
                    if (ot.dataset.inpage) {
                        document.querySelector(`#${ot.dataset.id}`).style.display = `block`;
                        hideLoader();
                    } else {
                        showLoader();
                        document.querySelector('#playgroundIframe').style.display = 'block';
                        document.querySelector('#playgroundIframe').src = ot.dataset.url;
                    }
                    updateRoute(ot.dataset.page);
                    document.querySelector('#navTog').checked = false

                }

            })
            handleRoute();






        })


}

function handleRoute() {
    let paramsString = document.location.href.replace(/.*\?/, '')
    let searchParams = new URLSearchParams(paramsString);

    //Iterate the search parameters.
    if (searchParams.has('page')) {
        let routeTo = searchParams.get('page') || '';
        let navBtn = document.querySelectorAll('.navLinkBtn')
        for (let eachBtn of navBtn) {
            let pageId = (eachBtn.dataset.page || '').toLowerCase().trim()
            if (pageId == routeTo.toLowerCase().trim()) {
                eachBtn.click();
            }
        }
    } else {
        setTimeout(_ => {
            document.querySelector('#playgroundIframe').src = `components/home/index.html`;
            updateRoute('home');
        }, 0)

    }


}

function updateRoute(pageId = '') {
    pageId = pageId.toLowerCase().trim() || 'home';
    history.pushState({}, document.title, `?page=${pageId}`)
}

var iframeWindow = document.getElementById('playgroundIframe').contentWindow

iframeWindow.addEventListener('load', function() {
    hideLoader();
});





function vaildateCacheIfOnline() {

    return new Promise((resolve, reject) => {

        fetch(`config.json?cacheBust=${new Date().getTime()}`)
            .then(response => { return response.json() })
            .then(config => {

                let installedVersion = Settings.getVersion()
                if (installedVersion == 0) {
                    Settings.setVersion(config.version)
                    document.querySelector('#version').innerHTML = `v${config.version}`;
                    return resolve();
                } else if (installedVersion != config.version) {
                    console.log('Cache Version mismatch')
                    fetch(`config.json?clean-cache=true&cacheBust=${new Date().getTime()}`).then(_ => {
                        //actually cleans the cache
                        Settings.setVersion(config.version);
                        window.location.reload();

                        return resolve(); // unnecessary
                    });

                } else {
                    // already updated
                    console.log('Cache Updated')
                    document.querySelector('#version').innerHTML = `v${installedVersion}`;
                    return resolve();
                }
            }).catch(err => {
                console.log(err);
                return resolve();
                //handle offline here 
            })
    })

}



const channel = new BroadcastChannel('iframeLoadComplete');
channel.addEventListener('message', event => {
    hideLoader();
});

function showLoader() {
    document.querySelector('.spinner').style.display = 'grid';
}

function hideLoader() {
    document.querySelector('.spinner').style.display = 'none';
}