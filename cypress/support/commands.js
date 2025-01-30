
Cypress.Commands.add('fillSignupFormAndSubmit', (email, password) => {
  cy.intercept('GET', '**/notes').as('getNotes')
  cy.visit('/signup')
  cy.get('#email').type(email)
  cy.get('#password').type(password, { log: false })
  cy.get('#confirmPassword').type(password, { log: false })
  cy.contains('button', 'Signup').click()
  cy.get('#confirmationCode').should('be.visible')
  cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
    sentTo: email
  }).then(message => {
    const confirmationCode = message.html.body.match(/\d{6}/)[0]
    cy.get('#confirmationCode').type(`${confirmationCode}{enter}`)
  })
  cy.wait('@getNotes', { timeout: 10000 }).then((interception) => {
    expect(interception.response.statusCode).to.eq(200)
  })
}) 

Cypress.Commands.add('guiLogin', (
  username = Cypress.env('USER_EMAIL'),
  password = Cypress.env('USER_PASSWORD')
) => {
  cy.intercept('GET', '**/notes').as('getNotes')
  cy.visit('/login')
  cy.get('#email').type(username)
  cy.get('#password').type(password, { log: false })
  cy.contains('button', 'Login').click()
  cy.wait('@getNotes', { timeout: 10000 }).then((interception) => {
    expect(interception.response.statusCode).to.eq(200)
  })
  cy.contains('h1', 'Your Notes').should('be.visible')
})
  
Cypress.Commands.add('sessionLogin', (
  username = Cypress.env('USER_EMAIL'),
  password = Cypress.env('USER_PASSWORD')
) => {
  const login = () => cy.guiLogin(username, password)
  cy.session(username, login)
})
 
const attachFileHandler = () => {        // criando uma variavel que é uma função que pega o arquivo com id 'file' e seleciona o arquivo que está dentro da pasta fixtures.
  cy.get('#file').selectFile('cypress/fixtures/example.json')
}

Cypress.Commands.add('createNote', (note , attachFile = false) => {  // recebe uma anotação e um attachFile. Onde attachFile por default eu não quero anexar nenunhum arquivo.
  cy.visit('/notes/new')  // visita a pagina de anotações.
  cy.get('#content').type(note)   // digita a anotação que foi recebida como argumento.

  if( attachFile ) {     // se tiverque ataxar um arquivo, execute o 'attachFileHandler' que vai executar a função que executa o comando 'selectFile' .
    attachFileHandler()
  }

  cy.contains('button', 'Create').click() // clica no botão de criar.
  cy.contains('.list-group-item', note).should('be.visible')   // e aguarda a anotação estar visivel na listagem.
})

Cypress.Commands.add('editNote', (note, newNoteValue, attachFile = false) => {  // recebe a anotação que queremos editar, o novo valor e se queremos ataxar um arquivo ou nao.
  cy.intercept('GET', '**/notes/**').as('getNote')    // definindo um intercept.
  
  cy.contains('.list-group-item', note).click()   // encontrando a anotação que foi recebida como argumento e clicando nela.
  cy.wait('@getNote')    

  cy.get('#content')    // encontra o campo de texto pelo id
    .as('contentField')    // da um nome para ele para não precisar repetir o seletor no resto do cypress
    .clear()     // limpa o campo.
  cy.get('@contentField')    // encontra ele pelo alias criado acima 'contentField'
    .type(newNoteValue)  // digitar as novas 4 palavras aleatórias.

  if (attachFile) {        // se tiverque ataxar um arquivo, execute o 'attachFileHandler' que vai executar a função que executa o comando 'selectFile' .
    attachFileHandler()
  }

  cy.contains('button', 'Save').click()   // clica no botão de salvar.

  cy.contains('.list-group-item', newNoteValue).should('be.visible')   //verifica se a nova anotação esta visivel na listagem.
  cy.contains('.list-group-item', note).should('not.exist')    // e que a antiga anotação nao esteja mais visivel na listagem.

})

Cypress.Commands.add('deleteNote', (note) => {
  cy.contains('.list-group-item', note).click()    // clica na anotação a partir da pagina inicial.
  cy.contains('button', 'Delete').click()        // clica no botão de deletar.

  cy.get('.list-group-item')          //verifica se tem pelo menos  1 botão para criar uma anotação
    .its('length')
    .should('be.at.least', 1)
  cy.contains('.list-group-item', note)  // verifica se a anotação foi excluida.
    .should('not.exist')
})

Cypress.Commands.add('fillSettingsFormAndSubmit', () => {
  cy.visit('/settings')   // visita a pagina /settings.
  cy.get('#storage').type('1')  // encontra o campo com id storage e digita 1.
  cy.get('#name').type('Mary Doe')   // encontra o campo com id name e digita o nome 'Mary Doe'.
  cy.iframe('.card-field iframe')    // pega o iframe que está dentro do elemento card-field.
    .as('iframe')                 //da o nome para ele, um alias.
    .find('[name="cardnumber"]')   // encontra dentro desse iframe um elemento com o name cardnumber(numero do cartão).
    .type('4242424242424242')    // digita o numero do cartão.
  cy.get('@iframe')             
    .find('[name="exp-date"]')    //pega o iframe novamente e encontra nele a data de expiração.
    .type('1271')                 // digita a data de expiração.
  cy.get('@iframe')
    .find('[name="cvc"]')      //pega o iframe e encontra o campo cvc.
    .type('123')                 // digita o cvc
  cy.get('@iframe')
    .find('[name="postal"]')     //pega o iframe e encontra o campo do código postal.
    .type('12345')                 // digita o código postal.
  cy.contains('button', 'Purchase').click()        //encontra o botão de 'purchase' e clica nele.
})