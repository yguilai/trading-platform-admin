<template>
  <div class="app-container">
    <div class="app-filter">
      <el-button type="primary" icon="el-icon-plus" @click="openDialog('add')">新建</el-button>
    </div>

    <el-table
      v-loading="isTableLoad"
      :data="page.list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="ID" width="150" prop="id" align="center" header-align="center" fixed />
      <el-table-column label="用户名" min-width="450" align="center" header-align="center">
        <template slot-scope="{ row }">
          <template v-if="row.edit">
            <el-input v-model="row.username" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="mini"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              取消
            </el-button>
          </template>
          <span v-else>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="150" align="center" prop="status" header-align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusFilter" effect="dark" @click="updateSysUserStatus(row)">
            {{ row.status | statusContentFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200" prop="createTime" align="center" header-align="center" />
      <el-table-column
        label="最近改密时间"
        width="200"
        prop="lastPasswordResetDate"
        align="center"
        header-align="center"
      />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            v-if="row.edit"
            type="success"
            size="mini"
            icon="el-icon-circle-check"
            @click="handleTableEdit(row)"
          >
            确认
          </el-button>
          <el-button
            v-else
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="row.edit = !row.edit"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
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

    <el-dialog :title="dialog.titleMap[dialog.type]" :visible.sync="dialog.visible" @closed="onDialogClosed">
      <el-form ref="form" :model="dialog.model" label-width="100px" style="width: 450px" :rules="dialog.rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialog.model.username" auto-complete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dialog.model.password" type="password" auto-complete="off" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialog.model.status">
            <el-option
              v-for="(item, index) in statusList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">取 消</el-button>
        <!--<el-button v-if="dialog.type !== 'add'" type="primary" @click="doEdit">确 定</el-button>-->
        <el-button type="primary" @click="doAdd">添加</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { addSysUser, deleteSysUser, getSysUserPage, updateSysUserStatus, changeUserName } from '@/api/sysUser'

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
          return '正常'
        case 0:
          return '禁用'
      }
    }
  },
  data() {
    return {
      // 表格是否在加载状态
      isTableLoad: true,
      // 表格当前页的数据
      page: {
        pageSize: 20,
        pages: 0,
        list: [],
        pageNum: 1,
        total: 0
      },
      // 弹出层
      dialog: {
        visible: false,
        titleMap: { view: '当前管理员', edit: '编辑', add: '添加' },
        type: '',
        model: {
          username: '',
          password: '',
          status: 0
        },
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 5, max: 16, message: '长度在 5 到 16 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请选中状态', trigger: 'blur' }
          ]
        }
      },
      defaultSysUserModel: {
        username: '',
        password: ''
      },
      statusList: [{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 加载数据
    async fetchData() {
      this.isTableLoad = true
      try {
        const { data } = await getSysUserPage({ page: this.page.pageNum, size: this.page.pageSize })
        data.list = data.list.map(row => {
          this.$set(row, 'edit', false)
          row.rawUsername = row.username
          return row
        })
        this.page = data
      } catch (err) {
        this.$message.error(err.message)
      }
      this.isTableLoad = false
    },
    // 处理编辑
    async handleTableEdit(row) {
      const newName = row.username
      if (newName === row.rawUsername) {
        this.$message.warning('用户名未修改')
        return
      }

      try {
        await changeUserName(row.id, newName)
        row.edit = false
        row.rawUsername = newName
        this.$store.commit('user/SET_NAME', newName)
        this.$message({
          message: '用户名修改成功',
          type: 'success'
        })
      } catch (e) {
        row.title = row.rawUsername
        this.$message({
          message: e.message,
          type: 'error'
        })
      }
    },
    // 取消编辑
    cancelEdit(row) {
      row.username = row.rawUsername
      row.edit = false
      this.$message({
        message: '已恢复原用户名',
        type: 'info'
      })
    },
    // 处理删除
    handleDelete(row) {
      this.$confirm('确认删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          try {
            await deleteSysUser(row.id)
            this.$message.success('删除成功')
          } catch (e) {
            this.$message.error(e.message)
          }
        })
        .catch(() => {})
    },
    // 执行添加
    doAdd() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            await addSysUser(this.dialog.model)
            this.$message.success('添加成功')
            this.fetchData()
            this.dialog.visible = false
          } catch (e) {
            this.$message.error(e.message)
          }
          this.dialog.visible = true
        } else {
          return false
        }
      })
    },
    // 修改系统用户状态
    updateSysUserStatus(row) {
      const op = row.status === 1 ? '禁用' : '启用'
      this.$confirm(`确认${op}该用户?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          try {
            await updateSysUserStatus(row.id)
            row.status = row.status === 1 ? 0 : 1
            this.$message.success(`${op}成功`)
          } catch (e) {
            this.$message.error(e.message)
          }
        })
        .catch(() => {})
    },
    // 打开弹出层
    openDialog(type) {
      this.dialog.type = type
      this.dialog.visible = true
    },
    // 弹出层关闭钩子
    onDialogClosed() {
      this.dialog.model = { ...this.defaultSysUserModel }
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-tag:hover {
    cursor: pointer;
  }

  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 0;
    bottom: 0;
    margin: auto;
    height: 32px;
  }
</style>
