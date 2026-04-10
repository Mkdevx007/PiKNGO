package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, Long> {
}
