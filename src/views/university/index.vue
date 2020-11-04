<template>
  <div class="app-container">
    <div class="app-filter">
      <el-cascader
        v-model="selectedCity"
        :props="cityCascaderProp"
        :options="cityTree"
        @change="handleCityChange"
      />
    </div>

    <el-table
      v-loading="isTableLoad"
      :data="page.list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="ID" width="150" prop="id" align="center" header-align="center" />
      <el-table-column label="编号" align="center" prop="code" header-align="center" />
      <el-table-column label="高校名" align="center" prop="name" header-align="center" />
      <el-table-column label="所在城市" width="150" prop="location" align="center" header-align="center" />
      <el-table-column label="状态" width="150" align="center" prop="status" header-align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter" effect="dark" @click="updateUniversityStatus(row)">
            {{ row.status | statusContentFilter }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next"
      :page-size="page.pageSize"
      :page-count="page.pages"
      :current-page.sync="page.pageNum"
      @current-change="fetchData"
      @prev-click="fetchData"
      @next-click="fetchData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAllUniversityPageByCity, updateUniversityStatus } from '@/api/university'

export default {
  filters: {
    statusFilter(val) {
      switch (val) {
        case 1:
          return 'primary'
        case 0:
          return 'danger'
      }
    },
    statusContentFilter(val) {
      switch (val) {
        case 1:
          return '开放'
        case 0:
          return '禁用'
      }
    }
  },
  data() {
    return {
      isTableLoad: true,
      page: {
        pageSize: 20,
        pages: 0,
        list: [],
        pageNum: 1,
        total: 0
      },
      value: [],
      cityCascaderProp: {
        label: 'name',
        value: 'name'
      },
      selectedCity: ['湖南省', '长沙市']
    }
  },
  computed: {
    ...mapGetters(['cityTree'])
  },
  created() {
    if (this.cityTree.length === 0) {
      this.$store.dispatch('city/getCityTree')
    }
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.isTableLoad = true
      try {
        const { data } = await getAllUniversityPageByCity(this.selectedCity[1], {
          page: this.page.pageNum,
          size: this.page.pageSize
        })
        this.page = data
      } catch (e) {
        this.$message.error(e.message)
      }
      this.isTableLoad = false
    },
    handleCityChange(value) {
      this.page.pageNum = 1
      this.fetchData()
    },
    updateUniversityStatus(row) {
      const op = row.status === 1 ? '禁用' : '启用'
      this.$confirm(`确认${op}该高校?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          try {
            await updateUniversityStatus(row.id)
            this.$message.success(`${op}成功`)
            row.status = row.status === 1 ? 0 : 1
          } catch (e) {
            this.$message.error(e.message)
          }
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-tag:hover {
    cursor: pointer;
  }
</style>
