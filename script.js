// global constands
const reel_roll = document.getElementById('reel_roll'),
        configuration = document.getElementById('configuration'),
        config_wrap = document.getElementById('config_wrap')


// config obj
let config = {
    subreddit_name: '',
    limit: '1',
    listing: 'new',

    after: ''
};


// toast
const toast_block = document.getElementById('toast')
const toast = (msg = "", isError = false) => {
    let p = document.createElement('p')
    p.innerHTML = `<p>${msg}</p><span onclick="this.parentElement.remove()">x</span>`
    toast_block.append(p)
    if (isError){
        p.style.background = 'red'
    } else{
        setTimeout(() => {
            p.remove()
        }, 2000)
    }
}


// save the details
configuration.addEventListener('submit', e => {
    e.preventDefault()

    let pre_sub_reddit = config.subreddit_name

    config.subreddit_name = configuration.subreddit_name.value
    config.limit = configuration.limit.value
    config.listing = configuration.listing.value
    // console.table(config)
    toast(`r/${config.subreddit_name} limited to ${config.limit} listed by ${config.listing}`)
    
    localStorage.subreddit_name = config.subreddit_name
    localStorage.limit = config.limit
    localStorage.listing = config.listing

    console.log('-----WROTE IN LS-----')

    config_wrap.style.display = 'none'

    if (pre_sub_reddit !== config.subreddit_name) config.after = '';

    loadFeed(1)
});


// onload load the sub name
window.addEventListener('load', e => {
    if (localStorage.subreddit_name !== undefined){

        config.subreddit_name = localStorage.subreddit_name
        config.limit = localStorage.limit
        config.listing = localStorage.listing || 'hot'

        // console.table(config)
        configuration.subreddit_name.value = config.subreddit_name
        configuration.limit.value = config.limit
        configuration.listing.value = config.listing

        console.log('-----ASSIGNED TO FORM-----')

        toast(`r/${config.subreddit_name} limited to ${config.limit} listed by ${config.listing}`)

        config_wrap.style.display = 'none' 
    }

    loadFeed(1)
});


// open config
const openConfiguration = () => {
    if (getComputedStyle(config_wrap).display == 'flex'){
        config_wrap.style.display = 'none'
    } else {
        config_wrap.style.display = 'flex'
    };
};



// // scroll listener
let fired_once = false, padding = 50;
window.onscroll = function() {
    // console.log((window.innerHeight + Math.ceil(window.pageYOffset)), document.body.offsetHeight)
    if ((window.innerHeight + Math.ceil(window.pageYOffset)) + padding >= document.body.offsetHeight && !fired_once){
        fired_once = true
        if (mode) loadFeed()
    };
    if ((window.innerHeight + Math.ceil(window.pageYOffset)) + padding < document.body.offsetHeight && fired_once){
        fired_once = false
    };
};


let mode = true;
// switchMode
const switchMode = (label) => {
    mode = !mode;
    if (mode){
        toast('Auto mode enaled')
    } else {
        toast('Manual mode enaled')
    };
};

// get reddit
const loadFeed = (__limit) => {

    console.log('-------FETCHING------')
    toast(`loading posts`)

    let url = `https://www.reddit.com/r/${config.subreddit_name}/${config.listing}.json?limit=${__limit ? __limit : config.limit}&after=${config.after}`;

    console.log(`FETCHING: ${url}`)

    let images_loaded = 0;

    fetch(url).then(result => {
        result.json().then(data => {

            console.log(`--------GOT ${data.data.children.length} RESULT-------`)

            config.after = data.data.after

            data.data.children.forEach(child => {

                // console.log(child.data)

                let author = child.data.author,
                    created_utc = (new Date(child.data.created_utc * 1000)).toString().slice(0, 24),
                    is_video = child.data.is_video,
                    permalink = child.data.permalink,
                    preview  = child.data.preview,
                    selftext = child.data.selftext,
                    subreddit = child.data.subreddit,
                    title = child.data.title,
                    ups = child.data.ups,
                    url = child.data.url;

                // console.table(preview[0])
                console.log(created_utc)

                if (/\.(jpg|jpeg|png|webp|avif|gif|svg|gifv)$/.test(url)){
                
                    let div = document.createElement('div')
                    div.innerHTML = `<p class="title">${title} <a target="_blanlk" href="http://reddit.com${permalink}"> [GO] </a></p>
                                <img src="${url}" loading="lazy" class="image">
                                <div class="deatil">
                                    <p class="created_at">Posted at ${created_utc}</p>
                                    <span class="auther">By ${author} </span>
                                    <span class="subreddit"> from r/${subreddit} </span>
                                    <span class="ups"> with ${ups} upvotes.</span>
                                    <p class="selftext">${selftext}</p>
                                </div>`;

                    div.classList.add('post')

                    reel_roll.append(div)

                    images_loaded = images_loaded + 1
                };


            });

            if(images_loaded === 0) loadFeed(5);
        })

    }).catch(e => {
        console.log(e)
        toast(e.toString(), true)
    })

};