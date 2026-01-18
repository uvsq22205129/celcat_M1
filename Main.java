import java.util.ArrayList;

public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("Celcat Calendar Processor");
        PresetManager presetManager = new PresetManager();
        Calandar calandar = new Calandar(presetManager, "2026-01-19", "2026-01-24", ViewType.WEEK);
        calandar.addGroup("Thomas", new Group("MIN17212", "2"));
        calandar.addGroup("Thomas", new Group("MIN17218", "2"));
        calandar.addGroup("Thomas", new Group("MIN17217", "2"));
        calandar.addGroup("Thomas", new Group("MSANGS2I", "4"));
        calandar.addGroup("Thomas", new Group("MIN17201", "3"));
        calandar.addGroup("Thomas", new Group("MIN15221", "1"));
        calandar.setCurrentPreset("Thomas");
        calandar.getCours().forEach(cours -> {
            System.out.println(cours);
        });
    }
}
