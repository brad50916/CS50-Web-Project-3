document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
  document.querySelector("#compose-form").onsubmit = function() {
    event.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });
    setTimeout(function(){ load_mailbox('sent'); }, 10);
  }
  
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function recompose_email(a,b,c,d) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = a;
  if(b.substr(0,2)==="RE")
    document.querySelector('#compose-subject').value = b;
  else
    document.querySelector('#compose-subject').value = 'RE: ' + b;
  document.querySelector('#compose-body').value = 'On '+d+ ' ' + a + ' wrote:\n\n  '+c;
}

function email_content(email, help) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').style.display = 'block'; 

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
  document.querySelector('#view').innerHTML = `<h5>From:</h5> ${email.sender}<br>
  <h5>To:</h5> ${email.recipients}<br>
  <h5>Subject:</h5> ${email.subject}<br>
  <h5>Timestamp:</h5> ${email.timestamp}`
  if(help==1){
    document.querySelector('#view').innerHTML += `<br><span>
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
    </span>
    <span>
    <button class="btn btn-sm btn-outline-primary" id="arc">Archive</button>
    </span>
    `
  }else if(help==2){
    document.querySelector('#view').innerHTML += `<br><span>
    <button class="btn btn-sm btn-outline-primary" id="unarc">Unarchive</button>
    </span>`
  }
  document.querySelector('#view').innerHTML += `<hr><div class="body">${email.body}</div>`;
  if(help==1){
    document.querySelector('#reply').addEventListener('click', () => {
      recompose_email(email.sender,email.subject,email.body,email.timestamp)
    })
    document.querySelector('#arc').addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      setTimeout(function(){ load_mailbox('inbox'); }, 10);
    })
  }
  if(help==2){
    document.querySelector('#unarc').addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      setTimeout(function(){ load_mailbox('inbox'); }, 10);
    })
  }
}

function view_emails(email, help) {
  const element = document.createElement('div');
  element.innerHTML = `<h5 class="recipients">${email.recipients}</h5>
  <span class="subject">${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}</span>
  <span class="time">${email.timestamp}</span>`;
  if(help==1){
    if(email.read){
      element.style.cssText = 'background-color: lightgray;'
    }
  }
  element.addEventListener('click', function() {
    fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email)
        email_content(email, help)
    });
  });
  document.querySelector('#emails-view').append(element);
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if(mailbox==='sent'){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails)
        emails.forEach(email => {
          view_emails(email, 0)
        })
        // ... do something else with emails ...
    });
  }
  if(mailbox==='inbox'){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails=> {
      console.log(emails)
      emails.forEach(email => {
        view_emails(email, 1)
      })
    })
  }
  if(mailbox==='archive'){
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails=> {
      emails.forEach(email => {
        view_emails(email, 2)
      })
    })
  }
}