package com.tournament.engine.modules.tournament.dto;

import com.tournament.engine.modules.tournament.model.Tournament;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TournamentCreateRequest {
    @NotBlank(message = "Tên giải đấu không được để trống")
    private String name;
    
    @NotNull(message = "Thể thức thi đấu không được để trống")
    private Tournament.MatchFormat format; // BO1, BO3, BO5
    
    @NotNull(message = "Cấu trúc giải đấu không được để trống")
    private Tournament.TournamentStructure structure; // SINGLE_ELIMINATION, GROUP_KNOCKOUT
    
    @NotNull(message = "Số đội tối đa không được để trống")
    @Min(value = 2, message = "Số đội tối thiểu phải là 2")
    private Integer maxTeams; // 8, 16, 32
    
    private String rulesDescription;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
    
    private String prizePool;
    private String location;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Tournament.MatchFormat getFormat() { return format; }
    public void setFormat(Tournament.MatchFormat format) { this.format = format; }

    public Tournament.TournamentStructure getStructure() { return structure; }
    public void setStructure(Tournament.TournamentStructure structure) { this.structure = structure; }

    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }

    public String getRulesDescription() { return rulesDescription; }
    public void setRulesDescription(String rulesDescription) { this.rulesDescription = rulesDescription; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getPrizePool() { return prizePool; }
    public void setPrizePool(String prizePool) { this.prizePool = prizePool; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
