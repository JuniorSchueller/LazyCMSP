const questions = [];
const questionElements = [];
let currentQuestion = 0;

function getPathTo(element) {
    if (!(element instanceof Element)) throw new Error("O parâmetro deve ser um elemento do DOM.");
    
    const path = [];
    
    while (element) {
        let selector = element.nodeName.toLowerCase();
        
        if (element.id) {
            selector += `#${element.id}`;
            path.unshift(selector);
            break;
        } else {
            const siblings = Array.from(element.parentNode.children);
            const sameTagSiblings = siblings.filter(sibling => sibling.nodeName === element.nodeName);
            if (sameTagSiblings.length > 1) {
                selector += `:nth-child(${Array.from(siblings).indexOf(element) + 1})`;
            }
        }
        
        path.unshift(selector);
        element = element.parentNode;
    }
    
    return path.join(' > ');
}

function getTaskQuestions() {
    document.querySelectorAll("#root > div.css-3gw59k > div").forEach(qst => {
        if (qst.textContent.includes('Nota')) {
            const question = qst.querySelector('div[style="padding: 0px 24px;"]');
            const answers = qst.querySelector('div.css-odg2wy');
            if (!answers.textContent.includes('Selecione as opções abaixo:')) {
                questions.push(question.textContent + '\n\n' + answers.textContent);
                questionElements.push(qst);
            }
        }
    });
}

async function replyQuestions() {
    if (currentQuestion <= questionElements.length) {
        const questionText = questions[currentQuestion];
        const questionElement = questionElements[currentQuestion];

        const answerRequest = await fetch('http://localhost:3000/getAnswer', {
            method: 'POST',
            body: JSON.stringify({'message': questionText})
        })
        const answerResponse = (answerRequest.json()).response;
        
        const questionParagraphs = questionElement.querySelectorAll('p');
        if (answerResponse.startsWith('A') || answerResponse.startsWith('B') || answerResponse.startsWith('C') || answerResponse.startsWith('D')) {
            const rightAnswer = Array.from(questionParagraphs).filter(el => el.textContent.startsWith(`${answerResponse.charAt(0)}) `));
            const rightAnswerPath = getPathTo(rightAnswer);
            const rightAnswerButton = rightAnswerPath.replace('div > p', 'label');
            document.querySelector(rightAnswerButton).click();
        }
    }
}