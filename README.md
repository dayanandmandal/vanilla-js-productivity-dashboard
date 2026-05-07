productivity-dashboard/
│
├── index.html
├── /css
│   ├── styles.css
│   ├── variables.css
│   └── responsive.css
│
├── /js
│   ├── main.js
│   ├── utils.js
│   ├── storage.js
│   │
│   ├── /modules
│   │   ├── todo.js
│   │   ├── notes.js
│   │   ├── weather.js
│   │   ├── timer.js
│   │   └── theme.js
│
├── /assets
│   ├── images/
│   └── icons/
│
└── README.md




Your logic assumes:

let activeEle = document.querySelector(".sidebar .active"); 👉 Works now

BUT if:
Sidebar is re-rendered later
Elements replaced - 👉 activeEle becomes stale