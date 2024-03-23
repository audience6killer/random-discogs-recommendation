import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config';

const PORT = process.env.PORT;
const API_KEY = process.env.DISCOGS_API_KEY
const API_SECRET = process.env.DISCOGS_API_SECRET
const app = express();

const API_URL = "https://api.discogs.com/"
const userAgent = "RandomDiscogsRecommendation/0.1";


function randomAlbumParser(body){

    var albumsRawList = body.results; 
    
    const randomElement = albumsRawList[Math.floor(Math.random() * albumsRawList.length)];
    //console.log(element)
    return {
        artist: randomElement.title.split(" - ")[0],
        album: randomElement.title.split(" - ")[1],
        year: randomElement.year,
        cover_image: randomElement.cover_image,
        discogs_link: "https://www.discogs.com" + randomElement.uri,
    };
}

async function getRandomAlbums(genre, randomAlbumsList=[], page=1, elementNo=5) {
    //var randomAlbumsList = [];
    if(elementNo === 0){
        console.log(randomAlbumsList);
        return randomAlbumsList;
    } else {
        try {
            const response = await axios.get(API_URL + 'database/search',{
                params: {
                    genre: genre,
                    key: API_KEY,
                    secret: API_SECRET,
                    page: page,
                }
            });
            //console.log("Album " + elementNo + ":\n" + JSON.stringify(response.data));
            randomAlbumsList.push(randomAlbumParser(response.data));
            
            var randomPage =  Math.floor(Math.random() * response.data.pagination.pages); 
            return getRandomAlbums(genre, randomAlbumsList, randomPage, --elementNo);
        } catch (error) {
            console.error("Failed to make request: " + error.message);
            return;
        }
        
    }
    
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/get-albums', async (req, res) => {
    try{
        var genre = req.body.genre;
        console.log(genre);
        const albumList = await getRandomAlbums(genre);
        res.render('albums.ejs', {genre: genre, albumList: albumList});
    }catch(error){
        console.error("Failed to make request: " + error.message);
        res.send(error.message)
    }
});

app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
})
