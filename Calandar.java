
import java.util.ArrayList;
import java.util.List;


class Calandar{
    private List<Group> groups;
    private String startDate;
    private String endDate;
    private ViewType viewType;
    /**
     * Constructor
     * @param groups list of group identifiers
     * @param startDate format "YYYY-MM-DDTHH:MM"
     * @param endDate   format "YYYY-MM-DDTHH:MM"
     * @param viewType  type of view {day, week, month}
     */
    public Calandar(List<Group> groups, String startDate, String endDate, ViewType viewType) {
        this.groups = groups;
        this.startDate = startDate;
        this.endDate = endDate;
        this.viewType = viewType;
    }

    public void addGroup(Group group){
        if (!this.groups.contains(group)){
            this.groups.add(group);
        }
    }

    public void removeGroup(Group group){
        this.groups.remove(group);
    }

    /**
     * Recupere les informations de tous les cours dans la liste des groupes
     * @return list of cours
     * @throws Exception
     */
    public List<Cours> getCours() throws Exception{
        List<Cours> coursList = new ArrayList<>();
        CelcatToJson celcatToJson = new CelcatToJson("https://edt.uvsq.fr/Home/GetCalendarData", this.viewType);
        for (Group group : this.groups){
            String jsonData = celcatToJson.getCalendarData(this.startDate, this.endDate, "103", group.getGroupNumber(), "3");
            JsonToCours jsonToCours = new JsonToCours(jsonData);
            coursList.addAll(jsonToCours.getCoursList()); // sans filtre des ues mettre en commentaire pour remettre le filtre de en bas
            //coursList.addAll(jsonToCours.getCoursList().stream().filter(e -> e.getTitle().contains(group.getUECode())).toList()); // avec filtre des ues
        }
        return coursList;
    }
}
