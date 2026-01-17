import java.util.List;
import java.util.Objects;

public class Group {
    private String UECode;
    private String groupNumber;

    public Group(String UECode, String groupNumber) {
        this.UECode = UECode;
        this.groupNumber = groupNumber;
    }

    public String getUECode() {
        return UECode;
    }

    public String getGroupNumber() {
        return groupNumber;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Group group = (Group) obj;
        return groupNumber.equals(group.groupNumber) && UECode.equals(group.UECode);
    }
    @Override
    public int hashCode() {
        return Objects.hashCode(List.of(UECode, groupNumber));
    }
}
