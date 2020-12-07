var deferredInstallPrompt = null;


window.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    showDownloadPrompt();
});


document.querySelectorAll('.downloadButton').forEach(btn => {
    btn.addEventListener('click', downloadButtonClicked);
})

function downloadButtonClicked() {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice
        .then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {

                deferredInstallPrompt = null;
                document.querySelector('.downloadPrompt').style.display = 'none';
                document.querySelector('#installNowPrompt').style.display = 'none';

            } else {
                console.log(choiceResult)
            }
        })
}

function showDownloadPrompt() {
    document.querySelector('.downloadPrompt').style.display = 'grid';
    document.querySelector('#installNowPrompt').style.display = 'block';
}

window.addEventListener('appinstalled', (evt) => {
    // Log install to analytics
    // alert('Install complete');

    /*if (!isInStandaloneMode()) {
        alert('open in app');
    }*/

    foo();
})


async function foo() {
    if ('getInstalledRelatedApps' in window.navigator) {
        const relatedApps = await navigator.getInstalledRelatedApps();
        //alert('Related', relatedApps.length)
        relatedApps.forEach((app) => {
            //if your PWA exists in the array it is installed
            //   alert(app.platform, app.url);
        });
    }
}

//foo();


const isInStandaloneMode = () => (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');