import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONObject;
import org.json.JSONArray;

class JsonToCours {
    private JSONArray jsonArray;
    public JsonToCours(String jsonData) {
        this.jsonArray = new JSONArray(jsonData);
    }
    private Cours parseCours(JSONObject jsonObject) {
        JSONArray modules;
        String title;

        if (jsonObject.has("modules") && !jsonObject.isNull("modules")) {
            modules = jsonObject.getJSONArray("modules");
            title = modules.toString();
        } else {
            title = "[\"Event\"]";
        }// dans certain cas exemple les réunions

        String startTime = jsonObject.getString("start");
        String endTime = jsonObject.getString("end");
        String location = jsonObject.getJSONArray("sites").getString(0);
        String description = jsonObject.getString("description");
        String type = jsonObject.getString("eventCategory");
        String group = null;// par defaut comme les CM
        Matcher matcher = Pattern.compile("gr\\.\\s*(\\d+)").matcher(description);//cherche les groupes

        if (matcher.find()) {
            group = matcher.group(1);// si il trouve il le change
        }

        return new Cours(title, startTime, endTime, location, description, type, group);
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