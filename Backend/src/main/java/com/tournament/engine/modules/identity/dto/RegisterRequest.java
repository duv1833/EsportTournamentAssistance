package com.tournament.engine.modules.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 20, message = "Tên đăng nhập phải từ 3 đến 20 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 12, message = "Mật khẩu phải có ít nhất 12 ký tự")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}$", message = "Mật khẩu phải có ít nhất 12 ký tự, gồm ít nhất 1 chữ số và 1 ký tự đặc biệt (!@#$%...)")
    private String password;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9][0-9]{8}|0[0-9]{9,10}|\\+?[0-9]{9,12})$", message = "Số điện thoại không hợp lệ (Ví dụ: 0912345678)")
    private String phoneNumber;

    @NotBlank(message = "Riot ID In-game không được để trống")
    @Pattern(regexp = "^.+#.{1,6}$", message = "Riot ID In-game không hợp lệ! Định dạng đúng: TênIngame#TAG (Ví dụ: TenZ#SEN, Player#VN1)")
    private String nickname;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
}
