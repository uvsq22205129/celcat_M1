import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;
import org.json.JSONArray;

class JsonToCours {
    private JSONArray jsonArray;
    public JsonToCours(String jsonData) {
        this.jsonArray = new JSONArray(jsonData);
    }
    private Cours parseCours(JSONObject jsonObject) {
        JSONArray modules = jsonObject.getJSONArray("modules");
        String title = modules.toString();
        String startTime = jsonObject.getString("start");
        String endTime = jsonObject.getString("end");
        String location = jsonObject.getJSONArray("sites").getString(0);
        String description = jsonObject.getString("description");
        String type = jsonObject.getString("eventCategory");

        return new Cours(title, startTime, endTime, location, description, type);
    }
    public List<Cours> getCoursList() {
        List<Cours> coursList = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject coursJson = jsonArray.getJSONObject(i);
            Cours cours = parseCours(coursJson);
            coursList.add(cours);
        }
        return coursList;
    }
}