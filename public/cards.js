const base = 'http://localhost:6789'

const main = document.querySelector('main')

function getCards(){
    axios.get(`${base}/cards`).then((res) => {
        main.innerText = ''
        for(let i = 0; i < res.data.length; i++){
            const {bank_name, card_id, card_img, card_name} = res.data[i]
            let cardCard = document.createElement('div')
            cardCard.setAttribute('id', `card-${card_id}`)
            cardCard.classList.add('card-card')
            cardCard.innerHTML = `
                <img class='card-img' src='${card_img}'/>
                <div class='title-btn'>
                    <div class='bank-title'>
                        <h2 class='bank'>${bank_name}</h2>
                        <h1 class='title'>${card_name}</h1>
                    </div>
                    <button class='more-btn' id='${card_id}'>More</button>
                </div>
            `
            main.appendChild(cardCard)
            document.getElementById(`${card_id}`).addEventListener('click', getMoreInfo)
        }
    })
}

function getMoreInfo(event){
    let moreBtns = document.querySelectorAll('.more-btn')
    moreBtns.forEach(btn => btn.style.display = 'none')

    axios.get(`${base}/card/${event.target.id}`).then((res) => {
        let {af, apr, bank_name, card_id, card_img, card_name, flat_rate, notes, reward_type, score, sub} = res.data[0]

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
        }

        
        let clicked = document.getElementById(`card-${event.target.id}`)
        clicked.classList = 'clicked'

        let index = Array.prototype.indexOf.call(main.children, clicked)
        main.insertBefore(main.children[index], main.firstChild)

        clicked.innerHTML = `
            <div id='left-column'>
                <img class='c-img' src='${card_img}'/>
                <div class='c-info'>
                    <div>
                        <h2 class='c'>${bank_name}</h2>
                        <h1 class='c'>${card_name}</h1>
                    </div>
                    <p class='c'>Score: ${score}</p>
                    <p class='c'>APR: ${apr}</p>
                    <p class='c'>AF: ${af === 0 ? 'None':`$${af}`}</p>
                    <p class='c'>Type: ${reward_type}</p>
                    <p class='c'>SUB: ${sub === '' ? 'None':sub}</p>
                    <p class='c'>${notes}</p>
                </div>
            </div>
            <section id='cat-sec'></section>
            <button id='X'>X</button>
        `
        document.getElementById('X').addEventListener('click', getCards)

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
                <p>This includes ${includes} and excludes ${excludes}.</p>
            `
            section.appendChild(category)
        }
        
        let flatRate = document.createElement('div')
        flatRate.setAttribute('id', `flat-cat`)
        flatRate.classList.add('cat-card')
        console.log(section.childNodes)
        if(section.childElementCount === 0){
            flatRate.innerHTML = `
            <p id='single-pringle'>This is a flat rate card. That means there are no special categories to earn higher percentages. You'll get unlimited ${flat_rate}${symbol} ${reward_type.toLowerCase()} on all purchases.</p>
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

getCards()