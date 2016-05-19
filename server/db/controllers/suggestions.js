

export function newest (db) => {
    db.task(function *(t){
        var suggestions = yield t.any("SELECT * FROM suggestions ORDER BY createdate DESC LIMIT 10");
        console.log("suggestions: ", suggestions);
        return suggestions;
    })
    .catch(function(error){
        console.log("Error in getUserSuggestions: ", error);
    })	
}