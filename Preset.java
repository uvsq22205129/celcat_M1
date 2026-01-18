import java.util.ArrayList;
import java.util.List;

public class Preset {
    private String name;
    private List<Group> groups;

    public Preset (String name) {
        this.name = name;
        this.groups = new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public List<Group> getGroups() {
        return groups;
    }

    public void addGroup(Group group) {
        if (!groups.contains(group)) {
            groups.add(group);
        }
    }

    public void removeGroup(Group group) {
        if (groups.contains(group)) {
            groups.remove(group);
        }
    }
}
