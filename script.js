// Script atualizado para integração com Tailwind e estilos visuais modernos

const API_KEY = 'api_key=356751cd1ffc0fd2b832aafa389a8f35&language=pt-BR';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');

let currentPage = 1;
let nextPage = 2;
let prevPage = 3;
let lastUrl = '';
let totalPages = 100;

const genres = [
  { id: 28, name: "Ação" }, { id: 12, name: "Aventura" }, { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" }, { id: 80, name: "Crimes" }, { id: 99, name: "Documentario" },
  { id: 18, name: "Drama" }, { id: 10751, name: "Familia" }, { id: 14, name: "Fantasia" },
  { id: 36, name: "Historia" }, { id: 27, name: "Terror" }, { id: 10402, name: "Musica" },
  { id: 9648, name: "Misterio" }, { id: 10749, name: "Romance" }, { id: 878, name: "Ficção" },
  { id: 10770, name: "FilmeTV" }, { id: 53, name: "Thriller" }, { id: 10752, name: "Guerra" },
  { id: 37, name: "Ocidental" }
];

let selectedGenre = [];
setGenre();

function setGenre() {
  tagsEl.innerHTML = '';
  genres.forEach(genre => {
    const t = document.createElement('div');
    t.classList.add('tag', 'px-3', 'py-1', 'bg-gray-700', 'text-white', 'rounded', 'cursor-pointer', 'hover:bg-gray-600');
    t.id = genre.id;
    t.innerText = genre.name;
    t.addEventListener('click', () => {
      if (selectedGenre.includes(genre.id)) {
        selectedGenre = selectedGenre.filter(id => id !== genre.id);
      } else {
        selectedGenre.push(genre.id);
      }
      getMovies(API_URL + '&with_genres=' + encodeURI(selectedGenre.join(',')));
      highlightSelection();
    });
    tagsEl.append(t);
  });
}

function highlightSelection() {
  document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('bg-yellow-500'));
  selectedGenre.forEach(id => {
    const highlightedTag = document.getElementById(id);
    if (highlightedTag) highlightedTag.classList.add('bg-yellow-500');
  });
  clearBtn();
}

function clearBtn() {
  let clear = document.getElementById('clear');
  if (!clear) {
    let btn = document.createElement('div');
    btn.classList.add('tag', 'px-3', 'py-1', 'bg-red-500', 'text-white', 'rounded', 'cursor-pointer');
    btn.id = 'clear';
    btn.innerText = 'Limpar x';
    btn.addEventListener('click', () => {
      selectedGenre = [];
      setGenre();
      getMovies(API_URL);
    });
    tagsEl.append(btn);
  }
}

function showMovies(data){
    main.innerHTML = '';

    const isDark = document.documentElement.classList.contains('dark');

    data.forEach(movie => {
        const { title, overview, vote_average, poster_path, release_date } = movie;
        const movieEl = document.createElement('div');
        movieEl.className = `
            movie p-4 rounded-2xl shadow-md transition bg-white text-black
            dark:bg-gray-800 dark:text-white
        `;

        movieEl.innerHTML = `
            <img class="rounded-xl mx-auto mb-4" src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1500"}" alt="${title}">
            <div class="movie-info flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold">${title}</h3>
                <span class="${getColor(vote_average)} font-bold px-2 py-1 rounded text-sm">${vote_average}</span>
            </div>
            <p class="text-sm opacity-80 mb-2">Lançamento: ${release_date}</p>
            <div class="overview mt-2">
                <h2 class="text-md font-semibold mb-1">Análise geral</h2>
                <p class="text-sm opacity-90">${overview}</p>
            </div>
        `;

        main.appendChild(movieEl);
    });

    function getColor(vote){
        if(vote >= 8){
            return 'bg-green-500 text-white';
        } else if(vote >= 4){
            return 'bg-yellow-500 text-black';
        } else {
            return 'bg-red-500 text-white';
        }
    }
}


function getMovies(url) {
  lastUrl = url;
  fetch(url).then(res => res.json()).then(data => {
    if (data.results.length !== 0) {
      showMovies(data.results);
      currentPage = data.page;
      nextPage = currentPage + 1;
      prevPage = currentPage - 1;
      totalPages = data.total_pages;
      current.innerText = currentPage;

      prev.classList.toggle('opacity-50', currentPage <= 1);
      next.classList.toggle('opacity-50', currentPage >= totalPages);

      tagsEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      main.innerHTML = `<h1 class="text-center text-xl text-gray-400">Ops.. sem resultados para sua pesquisa!</h1>`;
    }
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  selectedGenre = [];
  setGenre();
  getMovies(searchTerm ? searchURL + '&query=' + searchTerm : API_URL);
});

prev.addEventListener('click', () => {
  if (prevPage > 0) pageCall(prevPage);
});

next.addEventListener('click', () => {
  if (nextPage <= totalPages) pageCall(nextPage);
});

function pageCall(page) {
  let urlSplit = lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let key = queryParams.find(param => param.startsWith('page='));

  if (!key) {
    getMovies(lastUrl + '&page=' + page);
  } else {
    const newQueryParams = queryParams.map(param =>
      param.startsWith('page=') ? 'page=' + page : param
    ).join('&');
    getMovies(urlSplit[0] + '?' + newQueryParams);
  }
}



getMovies(API_URL);