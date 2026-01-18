import java.util.HashMap;
import java.util.Map;

public class PresetManager {
    private Map<String, Preset> presets = new HashMap<>();

    public Preset getOrCreate(String name) {
        return presets.computeIfAbsent(name, Preset::new);
    }

    public Preset get(String name) {
        return presets.get(name);
    }

    public void remove(String name) {
        presets.remove(name);
    }

    public Map<String, Preset> getAll() {
        return presets;
    }
}
