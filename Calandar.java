
import java.util.ArrayList;
import java.util.List;


class Calandar{
    private PresetManager presetManager;
    private Preset currentPreset;
    private String startDate;
    private String endDate;
    private ViewType viewType;
    /**
     * Constructor
     * @param presetManager list of group identifiers
     * @param startDate format "YYYY-MM-DDTHH:MM"
     * @param endDate   format "YYYY-MM-DDTHH:MM"
     * @param viewType  type of view {day, week, month}
     */
    public Calandar(PresetManager presetManager, String startDate, String endDate, ViewType viewType) {
        this.presetManager = presetManager;
        this.startDate = startDate;
        this.endDate = endDate;
        this.viewType = viewType;
    }

    public void setCurrentPreset(String presetName) {
        this.currentPreset = presetManager.getOrCreate(presetName);
    }

    public void addGroup(String presetName, Group group){
        Preset preset = presetManager.getOrCreate(presetName);
        preset.addGroup(group);
    }

    public void removeGroup(String presetName, Group group){
        Preset preset = presetManager.get(presetName);
        if (preset != null) {
            preset.removeGroup(group);
        }
    }

    /**
     * Recupere les informations de tous les cours dans la liste des groupes
     * @return list of cours
     * @throws Exception
     */
    public List<Cours> getCours() throws Exception{
        if (currentPreset == null) {
            throw new IllegalStateException("Pas de Preset selectionner");
        }
        CelcatToJson celcatToJson = new CelcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", this.viewType);
        List<Cours> coursList = new ArrayList<>();
        for (Group group : currentPreset.getGroups()){
            String jsonData = celcatToJson.getCalendarData(this.startDate, this.endDate, "103", "M1 info", "3");
            JsonToCours jsonToCours = new JsonToCours(jsonData);
            coursList.addAll(
                jsonToCours.getCoursList().stream()
                    .filter(cours -> cours.getTitle().contains(group.getUECode()))//premier filtre sur UE
                    .filter(cours -> {
                        if (cours.isCM()) {
                            return true;
                        }
                        if (cours.isTD()) {
                            return cours.getGroup() != null
                                && cours.getGroup().equals(group.getGroupNumber());
                        }
                        return false;
                    })
                    .toList()//gère si c un CM osef du groupe mais si c un TD il le prend en compte
            );
        }
        return coursList;
    }
}
