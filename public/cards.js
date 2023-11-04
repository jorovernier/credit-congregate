const base = 'http://localhost:6789'
let terms = ['bank_name', 'ASC'];
let filterTerms;
let loggedIn = true;

const main = document.querySelector('main')
const wee = document.querySelector('.wee')
const sortForm = document.getElementById('sort-form')
const filterForms = document.querySelectorAll('.filter-form')

function isFilter(){
    if(filterTerms) {
        if(filterTerms[filterTerms.length - 1] === 'mega'){
            axios.get(`${base}/cards/megafilter?filter=${filterTerms}`).then((res) => {
                displayCard(res.data)
            })
        } else if(filterTerms){
            axios.get(`${base}/cards/filter?filter=${filterTerms}&order=${terms}`).then((res) => {
                displayCard(res.data)
            })
        }
    } else {
        getCards(terms)
    }
}

function getCards(sortTerms){
    axios.get(`${base}/cards?sort=${sortTerms[0]}&order=${sortTerms[1]}`).then((res) => {
        displayCard(res.data)
    })
}

function displayCard(arr){
    if(arr.length === 0) {
        main.innerHTML = `
            <div id='none-found'>No cards found!</div>
        `
    } else {
        main.innerText = ''
        for(let i = 0; i < arr.length; i++){
            const {bank_name, card_id, card_img, card_name} = arr[i]
            let cardCard = document.createElement('div')
            cardCard.setAttribute('id', `card-${card_id}`)
            cardCard.classList.add('card-card')
            cardCard.innerHTML = `
                <img class='card-img' src='${card_img}'/>
                <div class='title-btn'>
                    <hgroup class='bank-title'>
                        <h2 class='bank'>${bank_name}</h2>
                        <h1 class='title'>${card_name}</h1>
                    </hgroup>
                    <button class='more-btn steez' id='${card_id}'>More</button>
                </div>
            `
            main.appendChild(cardCard)
            document.getElementById(`${card_id}`).addEventListener('click', getMoreInfo)
        }
    }
}

function getMoreInfo(e){
    let moreBtns = document.querySelectorAll('.more-btn')
    moreBtns.forEach(btn => btn.style.display = 'none')
    document.documentElement.scrollTop = 0
    axios.get(`${base}/card/${e.target.id}`).then((res) => {
        let {af, apr, bank_name, card_id, card_img, card_name, ff, flat_rate, notes, reward_type, score, secured, student, sub} = res.data[0]

        let symbol;
        if(reward_type === 'c'){
            reward_type = 'Cashback'
            symbol = '%'
        } else if(reward_type === 'm'){
            reward_type = 'Miles'
            symbol = 'X'
        } else if(reward_type === 'p'){
            reward_type = 'Points'
            symbol = 'X'
        } else if(reward_type === 'n'){
            reward_type = 'No Rewards'
            symbol = ''
        }

        
        let clicked = document.getElementById(`card-${e.target.id}`)
        clicked.classList = 'clicked'

        let index = Array.prototype.indexOf.call(main.children, clicked)
        main.insertBefore(main.children[index], main.firstChild)

        clicked.innerHTML = `
            <div id='left-column'>
                <img class='c-img' src='${card_img}'/>
                <section class='c-info'>
                    <div id='head-btns'>
                        <hgroup>
                            <h2 class='c'>${bank_name}</h2>
                            <h1 class='c'>${card_name}</h1>
                        </hgroup>
                        ${loggedIn?
                            `<section>
                                <button class='btn-house'><img title='Have' id='have-check-${e.target.id}' class='house-icon' src='./pics/check.png'/></button>
                                <button class='btn-house'><img title='Want' id='want-star-${e.target.id}' class='house-icon' src='./pics/star.png'/></button>
                            </section>`
                            :`<div></div>`
                        }
                    </div>
                    <p class='c'>Score: ${score}</p>
                    <p class='c'>APR: ${apr}</p>
                    <p class='c'>AF: ${af === 0 ? 'None':`$${af}`}</p>
                    <p class='c'>Type: ${reward_type}</p>
                    <p class='c'>SUB: ${sub === '' ? 'None':sub}</p>
                    <p class='c'>${notes}</p>
                </section>
            </div>
            <section id='cat-sec'></section>
            <button class='remove' id='X'>X</button>
        `
        document.getElementById('X').addEventListener('click', isFilter)
        if(loggedIn){
            document.getElementById(`have-check-${e.target.id}`).addEventListener('click', (e) => {
                addToProfile(e, 'have')
            })
            document.getElementById(`want-star-${e.target.id}`).addEventListener('click', (e) => {
                addToProfile(e, 'want')
            })
        }
        let section = document.getElementById('cat-sec')

        for(let i = 1; i < res.data.length; i++){
            let {cat_id, tags, cat_name, reward_rate, spend_cap, includes, excludes} = res.data[i]

            if(includes === ''){
                includes = 'all expected category purchases'
            }
            if(excludes === ''){
                excludes = 'nothing'
            }

            let category = document.createElement('div')
            category.setAttribute('id', `cat-${cat_id}`)
            category.classList.add('cat-card')
            category.innerHTML = `
                <p>You'll get ${reward_rate}${symbol} ${reward_type.toLowerCase()} on all ${cat_name} purchases with ${spend_cap === '' ? 'no':`a $${spend_cap}`} limit.</p>
                <p>This includes ${includes}${excludes === 'nothing'?`.`:` and excludes ${excludes}.`}</p>
            `
            section.appendChild(category)
        }
        
        let flatRate = document.createElement('div')
        flatRate.setAttribute('id', `flat-cat`)
        flatRate.classList.add('cat-card')
        if(section.childElementCount === 0 && card_name === 'Travel' && bank_name === 'Discover'){
            flatRate.innerHTML = `
            <p id='single-pringle'>This is a flat rate card. That means there are no special categories to earn higher percentages. You'll get unlimited ${flat_rate}${symbol} ${reward_type.toLowerCase()} on all travel purchases.</p>
            `
            flatRate.style.width = '400px'
        } else if(section.childElementCount === 0 && reward_type !== 'No Rewards'){
            flatRate.innerHTML = `
            <p id='single-pringle'>This is a flat rate card. That means there are no special categories to earn higher percentages. You'll get unlimited ${flat_rate}${symbol} ${reward_type.toLowerCase()} on all purchases.</p>
            `
            flatRate.style.width = '400px'
        } else if(section.childElementCount === 0 && reward_type === 'No Rewards'){
            flatRate.innerHTML = `
            <p id='single-pringle'>This card does not provide any kind of cashback or rewards points.</p>
            `
            flatRate.style.width = '400px'
        } else {
            flatRate.innerHTML = `
            <p>You'll get unlimited ${flat_rate}${symbol} ${reward_type.toLowerCase()} on all other purchases.</p>
            `
        }
        section.appendChild(flatRate)
        let singlePringle = document.getElementById('single-pringle')
        if(singlePringle){
            singlePringle.style.height = '250px'
            singlePringle.style.fontSize = '34px'
            singlePringle.style.margin = '5px'
        }
    })
}

function addToProfile(e, endpoint){
    let cardID = e.target.id.split('-')[2]
    axios.post(`${base}/user/${endpoint}`, {cardID, userID: 1})
}

function swoopy(){
    let sidebar = document.getElementById('sidebar')
    let filter = document.getElementById('filter')
    let sort = document.getElementById('sort')

    wee.classList.toggle('moved')
    
    if(sidebar.classList == "go-out"){
        sidebar.classList = "go-in";
        wee.textContent = '>'
    } else {
        wee.textContent = '<'
        sidebar.classList = "go-out";
    }

    if (sidebar.style.width === "400px") {
        sidebar.style.width = "0px";
    } else {
        sidebar.style.width = "400px";
    }

    if (filter.style.display === "flex") {
        filter.style.display = "none";
    } else {
        filter.style.display = "flex";
    }

    if (sort.style.display === "flex") {
        sort.style.display = "none";
    } else {
        sort.style.display = "flex";
    }
}
wee.addEventListener('click', swoopy)

function sortBy(e){
    e.preventDefault()
    let selectOptions = e.target.children[0].options
    terms = selectOptions[selectOptions.selectedIndex].value.split(',')
    isFilter()
}
sortForm.addEventListener('submit', sortBy)

function filterBy(e){
    e.preventDefault()
    if(e.target.children[1].value === ''){
        alert('Please fill in the form before hitting submit!')
    } else if(e.target.children[1].value && e.target.children[1].value.match(/[;{}|[\]\\]/g)){
        alert('INVALID ARG')
    } else {
        filterTerms = e.target.children[0].id.split('-')
        if(e.target.children[1].value){
            filterTerms.push(e.target.children[1].value)
        } else {
            filterTerms.push(e.target.children[1].children[0].value, e.target.children[1].children[1].value)
        }

        if(e.target.classList.contains('deluxe')){
            filterTerms.push('mega')
            axios.get(`${base}/cards/megafilter?filter=${filterTerms}`).then((res) => {
                displayCard(res.data)
            })
        } else {
            axios.get(`${base}/cards/filter?filter=${filterTerms}&order=${terms}`).then((res) => {
                displayCard(res.data)
            })
        }
        if(e.target.children[1].nodeName === "INPUT"){
            e.target.children[1].value = ''
        }
    }

}
for(let i = 0; i < filterForms.length; i++){
    filterForms[i].addEventListener('submit', filterBy)
}

getCards(terms)