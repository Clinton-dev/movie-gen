import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupTextarea = document.getElementById('setup-textarea')
const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
})

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60
  })
  movieBossText.innerText = response.data.choices[0].text.trim()

}

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline.Also include actor names in brackets after each character, feel free to choose real life actors that would best suit the role 
      ###
      outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
      synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
      ###
      outline: ${outline}
      synopsis: 
      `,
      max_tokens: 700
    }
  )
  let synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  fetchStars(synopsis)
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an eye catching, alluring movie title based on a synopsis
        ###
        synopsis: When the CIA's top asset -- his identity known to no one -- uncovers agency secrets, he triggers a global hunt by assassins set loose by his ex-colleague.
        title: The Gray Man
        ###
        synopsis: Back from the brink of death, commando Tyler Rake embarks on a dangerous mission to save a ruthless gangster's imprisoned family.
        title: Extraction 2
        ###
        synopsis: ${synopsis}
        title: 
      `,
    max_tokens: 25,
    temperature: 0.8
  })
  const title = response.data.choices[0].text.trim() 
  document.getElementById('output-title').innerText = title
  fetchImagePromt(title, synopsis)
}

async function fetchStars(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Extract star names from the given synopsis
    ###
    synopsis: The fate of humanity hangs in the balance as Earth's most powerful nations defend against a full-scale alien invasion. Using cutting-edge technology and an arsenal of powerful weapons, a global team of scientists and military leaders battle to protect mankind from the extraterrestrial onslaught. Colonel Jacob Rivers (Chris Pine) 
    stars: Chris Pine
    ###
    synopsis: Set in a prehistoric world, The Birth of Mankind follows a small tribe of hunter-gatherers at the dawn of human existence. Led by the wise Father Thark (John Hurt), the tribe works together to survive in a harsh and unforgiving environment. One day, a mysterious stranger named Ylar (Dwayne Johnson) stumbles into their village and presents them with a revolutionary concept 
    stars: Dwayne Johnson, John Hurt
    ###
    synopsis: ${synopsis}
    stars: 
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePromt(title, synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an image prompt for an artwork for movie idea
    ###
    title: Love's Time Warp

    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.

    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
    ###
    title: ${title}

    synopsis: ${synopsis}

    image description: 
    `,
    max_tokens: 100,
    temperature: 0.8
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML=`<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>` 
  document.getElementById('view-pitch-btn').addEventListener('click', ()=> {
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  })
}